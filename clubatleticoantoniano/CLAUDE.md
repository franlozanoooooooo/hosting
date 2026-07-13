# CLAUDE.md — Club Atlético Antoniano

Contexto para Claude Code. Plataforma web + intranet de cantera para un club de fútbol (Lebrija). Lee también [HANDOFF.md](HANDOFF.md) (puesta en marcha y estado detallado) y la carpeta [docs/](docs/) (arquitectura, modelo de datos, UX, pagos, RGPD, despliegue, roadmap).

## Stack y monorepo (pnpm + Turborepo)

```
apps/web        → Next.js 15 (App Router) + React 19 + Tailwind 4. Web pública + intranet + admin.
apps/api        → NestJS 11. API REST con JWT, RBAC y módulos de dominio.
packages/db     → Prisma (PostgreSQL). Schema en prisma/schema.prisma, cliente y seed.
packages/shared → zod schemas, enums de roles (ROLES), utilidades (formatEuros). Importar como @caa/shared.
packages/ui     → (placeholder) design system.
```

## Comandos

```bash
pnpm install                              # instalar todo el monorepo
cp .env.example .env                      # configurar entorno
docker compose up -d                      # Postgres :5432 + Adminer :8080
pnpm --filter @caa/db db:generate         # generar cliente Prisma (necesario antes de typecheck/build de la API)
pnpm --filter @caa/db db:push             # crear esquema en la BD
pnpm --filter @caa/db db:seed             # datos de ejemplo
pnpm dev                                  # web (:3000) + api (:4000)
pnpm --filter @caa/web dev                # SOLO web — arranca con datos mock, sin BD ni API
pnpm --filter @caa/api dev                # solo API
pnpm typecheck                            # type-check de todo
```

> La **web pública e intranet usan datos mock** (`apps/web/lib/mock-data.ts`) para verse sin backend. La API aún no está conectada al front.

## Convenciones (síguelas al escribir código)

- **Idioma**: comentarios y textos de UI en español; identificadores en inglés/español coherentes con el código existente.
- **Validación**: zod. Schemas compartidos en `packages/shared/src/schemas.ts` (reutilizados en front y API). No dupliques validaciones.
- **Roles (RBAC)**: `SUPER_ADMIN`, `ADMIN`, `COORDINADOR`, `ENTRENADOR`, `FAMILIA` (enum `Rol` en Prisma y `ROLES` en `@caa/shared`). En la API se protegen endpoints con `@Roles(...)` y `@Public()`; el `RolesGuard` y `JwtAuthGuard` son globales.
- **Scoping de datos**: una `FAMILIA` solo ve a sus hijos; aplica el filtro en la capa de servicio (ver `jugadores.service.ts` como referencia).
- **Dinero**: siempre en **céntimos** (enteros). Formatear con `formatEuros(centimos)` de `@caa/shared`.
- **Auth**: JWT access (15 min) + refresh rotativo en cookies httpOnly; contraseñas con Argon2id.
- **Datos de menores**: el club maneja datos de menores y bancarios → cumplir RGPD (ver `docs/05-seguridad-rgpd.md`). No persistir IBAN completo (solo últimos 4 + mandate_id del proveedor).

## Módulo de IA (Claude)

`apps/api/src/modules/ia/` usa el SDK oficial `@anthropic-ai/sdk` con modelo `claude-opus-4-8` y thinking adaptativo. Endpoints: `POST /api/ia/cronica`, `/api/ia/comunicacion`, `/api/ia/faq` (público), `/api/ia/documento/resumen`. Requiere `ANTHROPIC_API_KEY` en `.env` (sin ella la API arranca, pero esos endpoints dan 503). Al tocar este módulo, mantén el SDK oficial, salida estructurada con `output_config.format` y la defensa anti prompt-injection del FAQ.

## Pagos

GoCardless (domiciliación SEPA recurrente de cuotas) + Stripe (entradas puntuales). Servicios en `apps/api/src/modules/pagos/`. Las integraciones reales son **stubs** marcados con `// TODO` — falta cablear los SDKs y las claves. Webhooks idempotentes por `providerPaymentId`.

## Estado: hecho vs pendiente

**Hecho**: web pública (con fotos reales en `apps/web/public/images/`), intranet de familia (dashboard, pagos/SEPA, documentos, comunicaciones, calendario), estructura de admin, API con auth/RBAC/auditoría, modelo de datos completo, módulo de IA, botones de entradas → `https://antoniano.compralaentrada.com/`.

**Pendiente** (orden sugerido): conectar web↔API (sustituir mock-data por `lib/api.ts`), integración real de GoCardless/Stripe, protección de rutas en `/intranet` y `/admin` (hay `TODO`/`SEGURIDAD` en los layouts), generación de recibos PDF + subida a storage, migraciones Prisma versionadas (ahora `db:push`), tests y CI/CD (ver `docs/06-despliegue.md`).

## Notas

- Tras cambiar `prisma/schema.prisma`, ejecuta `pnpm --filter @caa/db db:generate`.
- Antes de hacer `typecheck`/`build` de la API en una máquina nueva: genera el cliente Prisma primero, o verás errores de tipos en `@caa/db`.
- No comitees `.env` (ya está en `.gitignore`); usa `.env.example` como referencia.
