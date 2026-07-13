import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { prisma } from "@caa/db";
import { ROLES, jugadorSchema, type Rol } from "@caa/shared";

import type { AuthUser } from "../../common/decorators/current-user.decorator";

@Injectable()
export class JugadoresService {
  /**
   * Lista jugadores aplicando scoping por rol:
   * - Roles de administración/técnicos: todos los jugadores.
   * - FAMILIA: únicamente los jugadores de los que es tutor (tutor_jugador).
   */
  async findAll(user: AuthUser) {
    if (this.esAdmin(user.rol)) {
      return prisma.jugador.findMany({
        orderBy: [{ apellidos: "asc" }, { nombre: "asc" }],
        include: {
          equipo: { select: { id: true, nombre: true } },
          // Para el panel: tutor de contacto y estado de su domiciliación.
          tutores: {
            select: {
              parentesco: true,
              esContactoPrincipal: true,
              tutor: {
                select: {
                  nombre: true,
                  apellidos: true,
                  email: true,
                  telefono: true,
                  mandatos: { select: { ibanLast4: true, estado: true, createdAt: true } },
                },
              },
            },
          },
        },
      });
    }

    // FAMILIA: resolvemos el tutor a partir del usuario y filtramos sus hijos.
    const tutor = await prisma.tutor.findUnique({
      where: { usuarioId: user.sub },
      select: { id: true },
    });
    if (!tutor) return [];

    return prisma.jugador.findMany({
      where: { tutores: { some: { tutorId: tutor.id } } },
      orderBy: [{ apellidos: "asc" }, { nombre: "asc" }],
      include: { equipo: { select: { id: true, nombre: true } } },
    });
  }

  /** Detalle de un jugador, respetando el scoping de FAMILIA. */
  async findOne(id: string, user: AuthUser) {
    const jugador = await prisma.jugador.findUnique({
      where: { id },
      include: {
        equipo: { select: { id: true, nombre: true } },
        tutores: { select: { tutorId: true, parentesco: true } },
      },
    });
    if (!jugador) throw new NotFoundException("Jugador no encontrado");

    if (!this.esAdmin(user.rol)) {
      const tutor = await prisma.tutor.findUnique({
        where: { usuarioId: user.sub },
        select: { id: true },
      });
      const esSuHijo = tutor && jugador.tutores.some((t) => t.tutorId === tutor.id);
      if (!esSuHijo) throw new ForbiddenException("No puedes ver este jugador");
    }

    return jugador;
  }

  /** Alta de jugador (solo administración). */
  async create(body: unknown) {
    const data = jugadorSchema.parse(body);
    return prisma.jugador.create({
      data: {
        nombre: data.nombre,
        apellidos: data.apellidos,
        fechaNacimiento: data.fechaNacimiento,
        dorsal: data.dorsal,
        equipoId: data.equipoId,
      },
    });
  }

  /** Actualización parcial (solo administración). */
  async update(id: string, body: unknown) {
    const data = jugadorSchema.partial().parse(body);
    const existe = await prisma.jugador.findUnique({ where: { id }, select: { id: true } });
    if (!existe) throw new NotFoundException("Jugador no encontrado");
    return prisma.jugador.update({ where: { id }, data });
  }

  /** Baja lógica (no borramos por integridad histórica de cuotas/documentos). */
  async remove(id: string) {
    const existe = await prisma.jugador.findUnique({ where: { id }, select: { id: true } });
    if (!existe) throw new NotFoundException("Jugador no encontrado");
    return prisma.jugador.update({ where: { id }, data: { activo: false } });
  }

  private esAdmin(rol: Rol): boolean {
    return rol !== ROLES.FAMILIA;
  }
}
