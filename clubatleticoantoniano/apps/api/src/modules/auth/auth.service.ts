import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { JwtService, type JwtSignOptions } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { createHash } from "node:crypto";
import { prisma } from "@caa/db";
import { loginSchema, registroFamiliaSchema, type Rol } from "@caa/shared";

import { AuditService } from "../audit/audit.service";
import type { AuthUser } from "../../common/decorators/current-user.decorator";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface ContextoPeticion {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Valida credenciales (DNI o email + password), emite el par de tokens y
   * registra el acceso. Lanza 401 ante cualquier fallo (sin filtrar si el
   * usuario existe o no).
   */
  async login(body: unknown, ctx: ContextoPeticion): Promise<{ user: AuthUser; tokens: TokenPair }> {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    const { identificador, password } = parsed.data;

    // El identificador puede ser email o DNI.
    const esEmail = identificador.includes("@");
    const usuario = await prisma.usuario.findFirst({
      where: esEmail
        ? { email: identificador.toLowerCase() }
        : { dni: identificador.toUpperCase() },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException("Credenciales no válidas");
    }

    const passwordOk = await argon2.verify(usuario.passwordHash, password);
    if (!passwordOk) {
      throw new UnauthorizedException("Credenciales no válidas");
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() },
    });

    const tokens = await this.emitirTokens(usuario.id, usuario.rol);
    await this.persistirRefreshToken(usuario.id, tokens.refreshToken);

    await this.audit.log({
      usuarioId: usuario.id,
      accion: "LOGIN",
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return { user: { sub: usuario.id, rol: usuario.rol }, tokens };
  }

  /**
   * Registro público de una familia (alta de cantera): crea Usuario FAMILIA +
   * Tutor + Jugador + vínculo, y genera las dos cuotas de la temporada
   * (1 de julio y 1 de enero). Deja al usuario autenticado (emite tokens).
   */
  async registro(body: unknown, ctx: ContextoPeticion): Promise<{ user: AuthUser; tokens: TokenPair }> {
    const parsed = registroFamiliaSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    const datos = parsed.data;
    const email = datos.email.toLowerCase();

    const existente = await prisma.usuario.findFirst({
      where: { OR: [{ email }, { dni: datos.dni }] },
      select: { id: true },
    });
    if (existente) {
      throw new ConflictException("Ya existe una cuenta con ese email o DNI");
    }

    const passwordHash = await argon2.hash(datos.password, { type: argon2.argon2id });

    // Cuotas de la temporada: dos plazos fijos (regla del club).
    const TEMPORADA = "2026/27";
    const PLAZOS = [
      { periodo: "2026-07", concepto: `1er plazo · temporada ${TEMPORADA}`, venceEn: new Date("2026-07-01") },
      { periodo: "2027-01", concepto: `2º plazo · temporada ${TEMPORADA}`, venceEn: new Date("2027-01-01") },
    ];
    const IMPORTE_PLAZO_CENTIMOS = 10000; // 100 €

    const usuario = await prisma.$transaction(async (tx) => {
      // Categoría a partir del equipo elegido ("Infantil A" → "Infantil").
      const nombreCategoria = datos.equipo.split(" ")[0];
      const categoria = await tx.categoria.upsert({
        where: { nombre: nombreCategoria },
        update: {},
        create: { nombre: nombreCategoria },
      });
      const equipo = await tx.equipo.upsert({
        where: { nombre_temporada: { nombre: datos.equipo, temporada: "2026/2027" } },
        update: {},
        create: { nombre: datos.equipo, temporada: "2026/2027", categoriaId: categoria.id },
      });

      const creado = await tx.usuario.create({
        data: {
          email,
          dni: datos.dni,
          passwordHash,
          rol: "FAMILIA",
          tutor: {
            create: {
              nombre: datos.nombre,
              apellidos: datos.apellidos,
              dni: datos.dni,
              telefono: datos.telefono,
              email,
            },
          },
        },
        include: { tutor: true },
      });

      const jugador = await tx.jugador.create({
        data: {
          nombre: datos.hijoNombre,
          apellidos: datos.hijoApellidos,
          fechaNacimiento: datos.hijoFechaNacimiento,
          equipoId: equipo.id,
          tutores: {
            create: {
              tutorId: creado.tutor!.id,
              parentesco: "TUTOR_LEGAL",
              esContactoPrincipal: true,
            },
          },
        },
      });

      await tx.cuota.createMany({
        data: PLAZOS.map((p) => ({
          jugadorId: jugador.id,
          periodo: p.periodo,
          concepto: p.concepto,
          importeCentimos: IMPORTE_PLAZO_CENTIMOS,
          venceEn: p.venceEn,
        })),
      });

      return creado;
    });

    const tokens = await this.emitirTokens(usuario.id, usuario.rol);
    await this.persistirRefreshToken(usuario.id, tokens.refreshToken);

    await this.audit.log({
      usuarioId: usuario.id,
      accion: "REGISTRO_FAMILIA",
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return { user: { sub: usuario.id, rol: usuario.rol }, tokens };
  }

  /**
   * Rota el refresh token: verifica firma + existencia en BD (no revocado ni
   * expirado), revoca el actual y emite uno nuevo.
   */
  async refresh(refreshToken: string | undefined): Promise<{ user: AuthUser; tokens: TokenPair }> {
    if (!refreshToken) {
      throw new UnauthorizedException("Falta refresh token");
    }

    let payload: { sub: string; rol: Rol };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException("Refresh token inválido");
    }

    const tokenHash = this.hashToken(refreshToken);
    const stored = await prisma.refreshToken.findFirst({
      where: {
        usuarioId: payload.sub,
        tokenHash,
        revocado: false,
        expiraEn: { gt: new Date() },
      },
    });
    if (!stored) {
      throw new UnauthorizedException("Refresh token no reconocido o caducado");
    }

    // Rotación: revocamos el anterior y emitimos uno nuevo.
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revocado: true },
    });

    const tokens = await this.emitirTokens(payload.sub, payload.rol);
    await this.persistirRefreshToken(payload.sub, tokens.refreshToken);

    return { user: { sub: payload.sub, rol: payload.rol }, tokens };
  }

  /** Revoca todos los refresh tokens activos del usuario. */
  async logout(usuarioId: string | undefined): Promise<void> {
    if (!usuarioId) return;
    await prisma.refreshToken.updateMany({
      where: { usuarioId, revocado: false },
      data: { revocado: true },
    });
    await this.audit.log({ usuarioId, accion: "LOGOUT" });
  }

  /** Devuelve el perfil del usuario autenticado para `GET /auth/me`. */
  async me(usuarioId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        email: true,
        dni: true,
        rol: true,
        activo: true,
        ultimoAcceso: true,
        tutor: { select: { id: true, nombre: true, apellidos: true } },
        staff: { select: { id: true, nombre: true, apellidos: true, cargo: true } },
      },
    });
    if (!usuario) throw new UnauthorizedException();
    return usuario;
  }

  // ───────── Helpers ─────────

  private async emitirTokens(sub: string, rol: Rol): Promise<TokenPair> {
    const payload = { sub, rol };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: (process.env.JWT_ACCESS_TTL ?? "15m") as JwtSignOptions["expiresIn"],
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: (process.env.JWT_REFRESH_TTL ?? "7d") as JwtSignOptions["expiresIn"],
      }),
    ]);
    return { accessToken, refreshToken };
  }

  /** Guarda el hash del refresh token (nunca el token en claro) en BD. */
  private async persistirRefreshToken(usuarioId: string, refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    const ttlDias = this.parseDias(process.env.JWT_REFRESH_TTL ?? "7d");
    await prisma.refreshToken.create({
      data: {
        usuarioId,
        tokenHash,
        expiraEn: new Date(Date.now() + ttlDias * 24 * 60 * 60 * 1000),
      },
    });
  }

  /**
   * Hash determinista (SHA-256) del refresh token para poder localizarlo en BD.
   * El token en sí ya es un JWT firmado de alta entropía, por lo que no precisa
   * sal/argon2; lo que importa es no almacenar el valor en claro.
   */
  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private parseDias(ttl: string): number {
    const match = /^(\d+)d$/.exec(ttl);
    return match ? Number(match[1]) : 7;
  }
}
