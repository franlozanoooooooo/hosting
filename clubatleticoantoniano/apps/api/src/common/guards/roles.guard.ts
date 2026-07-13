import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { ROLES, type Rol } from "@caa/shared";

import { ROLES_KEY } from "../decorators/roles.decorator";
import type { AuthUser } from "../decorators/current-user.decorator";

/**
 * Guard global de autorización por rol (RBAC).
 * Lee los roles permitidos de `@Roles(...)` y los compara con `req.user.rol`.
 * Si el handler no declara roles, permite el paso (la auth ya la cubre JwtAuthGuard).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Sin restricción de rol → solo requiere estar autenticado.
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const rol = req.user?.rol;

    if (!rol || !Object.values(ROLES).includes(rol)) {
      throw new ForbiddenException("Rol no válido");
    }

    if (!required.includes(rol)) {
      throw new ForbiddenException("No tienes permisos para esta acción");
    }

    return true;
  }
}
