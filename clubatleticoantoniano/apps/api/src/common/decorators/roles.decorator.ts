import { SetMetadata } from "@nestjs/common";
import type { Rol } from "@caa/shared";

/** Clave de metadata donde se guardan los roles permitidos de un handler. */
export const ROLES_KEY = "roles";

/**
 * Restringe el acceso a un endpoint a los roles indicados.
 * Lo evalúa `RolesGuard`. Ejemplo: `@Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)`.
 */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
