import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { Rol } from "@caa/shared";

/** Payload mínimo que `JwtAuthGuard` adjunta a `req.user`. */
export interface AuthUser {
  sub: string;
  rol: Rol;
}

/**
 * Inyecta el usuario autenticado (o una de sus propiedades).
 * Ejemplos: `@CurrentUser() user: AuthUser` · `@CurrentUser("sub") id: string`.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext): AuthUser | string | undefined => {
    const req = ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const user = req.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
