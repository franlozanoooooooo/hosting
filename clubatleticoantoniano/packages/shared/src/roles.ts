/** Roles efectivos del sistema (RBAC). Coincide con el enum `Rol` de Prisma. */
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  COORDINADOR: "COORDINADOR",
  ENTRENADOR: "ENTRENADOR",
  FAMILIA: "FAMILIA",
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];

/** Roles con acceso al panel de administración. */
export const ROLES_ADMIN: Rol[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.COORDINADOR,
  ROLES.ENTRENADOR,
];

/** Jerarquía para comprobaciones de privilegio (mayor = más permisos). */
export const NIVEL_ROL: Record<Rol, number> = {
  FAMILIA: 1,
  ENTRENADOR: 2,
  COORDINADOR: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5,
};

export function tieneNivel(rol: Rol, minimo: Rol): boolean {
  return NIVEL_ROL[rol] >= NIVEL_ROL[minimo];
}
