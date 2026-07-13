import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import type { Rol } from "@caa/shared";

import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import type { AuthUser } from "../decorators/current-user.decorator";

interface AccessTokenPayload {
  sub: string;
  rol: Rol;
}

/**
 * Guard global de autenticación.
 * - Respeta `@Public()`.
 * - Lee el access token de la cookie httpOnly `access_token` o del header
 *   `Authorization: Bearer <token>` (útil para clientes no-navegador).
 * - Adjunta `{ sub, rol }` a `req.user`.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException("No autenticado");
    }

    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      req.user = { sub: payload.sub, rol: payload.rol };
      return true;
    } catch {
      throw new UnauthorizedException("Token inválido o expirado");
    }
  }

  private extractToken(req: Request): string | undefined {
    // 1) Cookie httpOnly (flujo principal desde la web).
    const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
    const fromCookie = cookies?.["access_token"];
    if (fromCookie) return fromCookie;

    // 2) Header Authorization: Bearer <token>.
    const auth = req.headers["authorization"];
    if (auth?.startsWith("Bearer ")) return auth.slice(7);

    return undefined;
  }
}
