import { SetMetadata } from "@nestjs/common";

/** Clave de metadata que marca un endpoint como público (sin auth). */
export const IS_PUBLIC_KEY = "isPublic";

/**
 * Marca un endpoint como público: `JwtAuthGuard` lo dejará pasar sin token.
 * Útil para login, webhooks y rutas de la web pública.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
