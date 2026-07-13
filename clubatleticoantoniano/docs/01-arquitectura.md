# 01 · Arquitectura

> Autor: Arquitecto Full Stack · Revisado por PM, Seguridad/RGPD y Pagos.

## 1. Visión general

Plataforma dividida en dos productos sobre una misma base de datos y API:

- **Web pública** (marketing/contenido) — alto tráfico, indexable, mayoría SSR/SSG.
- **Intranet + Admin** (datos personales y pagos) — autenticada, RBAC, auditada.

```
                         ┌─────────────────────────────┐
   Visitante ──────────► │  Next.js (Vercel)            │
   Familia / Staff ────► │  - Web pública (SSG/ISR)     │
                         │  - Intranet (RSC + client)   │
                         │  - Admin                     │
                         └──────────────┬──────────────┘
                                        │ HTTPS (REST + cookies httpOnly)
                                        ▼
                         ┌─────────────────────────────┐
                         │  NestJS API (Railway/VPS)    │
                         │  Auth · RBAC · Audit         │
                         │  Módulos de dominio          │
                         └───┬─────────┬─────────┬──────┘
                             │         │         │
                  ┌──────────▼─┐  ┌────▼────┐  ┌─▼──────────┐
                  │ PostgreSQL │  │ Storage │  │ Pagos      │
                  │ (Prisma)   │  │ (S3)    │  │ GoCardless │
                  └────────────┘  └─────────┘  │ + Stripe   │
                                               └─────┬──────┘
                                                     │ webhooks
                                                     ▼
                                            NestJS /webhooks/*
```

## 2. Por qué este reparto Next.js + NestJS

- Next.js entrega la web pública con **ISR/SSG** (rápida, SEO, cacheable en CDN).
- La lógica sensible (pagos, datos de menores, RGPD) vive en **NestJS**, no en el front, lo que da un único punto de control de autorización, validación y auditoría.
- La intranet usa **React Server Components** para datos privados (no cacheables) y componentes cliente para interacción.

> Alternativa válida si se quiere reducir piezas: Next.js full-stack con Route Handlers. Recomendamos NestJS por la complejidad del dominio (pagos recurrentes, remesas SEPA, RBAC con 4 roles, auditoría RGPD): se beneficia de módulos, guards e interceptores de primera clase.

## 3. Autenticación y autorización

- **Login**: DNI **o** email + contraseña → access token (JWT, 15 min) + refresh token (rotativo, 7 días) en cookies `httpOnly`, `Secure`, `SameSite=Lax`.
- **Hash**: Argon2id (memoria 19 MiB, t=2, p=1).
- **RBAC**: 5 roles efectivos — `SUPER_ADMIN`, `ADMIN`, `COORDINADOR`, `ENTRENADOR`, `FAMILIA`. Guard `@Roles()` + `RolesGuard` en NestJS. En el front, los layouts de `/intranet` y `/admin` verifican rol en el servidor.
- **Scoping de datos**: una `FAMILIA` solo ve a *sus* jugadores; un `ENTRENADOR` solo sus equipos; `COORDINADOR` sus categorías. Se aplica en capa de servicio (filtros por `tutorId` / `equipoId`) y se refuerza con **RLS** opcional en Postgres.

## 4. Estructura de carpetas (detalle — entregable 3)

```
club-atletico-antoniano/
├─ apps/
│  ├─ web/
│  │  ├─ app/
│  │  │  ├─ (public)/                 # web pública
│  │  │  │  ├─ page.tsx               # Inicio
│  │  │  │  ├─ noticias/
│  │  │  │  ├─ primer-equipo/
│  │  │  │  ├─ cantera/
│  │  │  │  ├─ entradas/
│  │  │  │  ├─ club/
│  │  │  │  └─ contacto/
│  │  │  ├─ (auth)/login|recuperar/
│  │  │  ├─ intranet/                 # área privada familias/staff
│  │  │  │  ├─ layout.tsx             # guard de sesión
│  │  │  │  ├─ page.tsx               # dashboard padre
│  │  │  │  ├─ pagos/
│  │  │  │  ├─ documentos/
│  │  │  │  ├─ comunicaciones/
│  │  │  │  └─ calendario/
│  │  │  ├─ admin/                    # panel admin (RBAC)
│  │  │  │  ├─ jugadores|equipos|familias/
│  │  │  │  ├─ pagos/                 # cuotas, remesas, impagos
│  │  │  │  ├─ documentos/
│  │  │  │  ├─ noticias/
│  │  │  │  └─ comunicaciones/
│  │  │  └─ api/                      # BFF: proxy de cookies → API
│  │  ├─ components/  lib/  hooks/  styles/
│  │  └─ next.config.ts
│  └─ api/
│     ├─ src/
│     │  ├─ main.ts
│     │  ├─ app.module.ts
│     │  ├─ common/                   # guards, interceptors, filters, decorators
│     │  │  ├─ guards/ (jwt, roles)
│     │  │  ├─ interceptors/ (audit, logging)
│     │  │  └─ filters/ (http-exception)
│     │  ├─ config/                   # env validado con zod
│     │  └─ modules/
│     │     ├─ auth/
│     │     ├─ users/
│     │     ├─ tutores/
│     │     ├─ jugadores/
│     │     ├─ equipos/
│     │     ├─ categorias/
│     │     ├─ pagos/                 # cuotas, mandatos, remesas
│     │     │  ├─ gocardless/
│     │     │  └─ stripe/
│     │     ├─ documentos/
│     │     ├─ comunicaciones/
│     │     ├─ calendario/
│     │     ├─ noticias/
│     │     ├─ entradas/
│     │     ├─ audit/                 # logs de actividad RGPD
│     │     └─ webhooks/
│     └─ test/
├─ packages/
│  ├─ db/         # prisma/schema.prisma, client, migrations, seed
│  ├─ shared/     # zod schemas, DTOs, enums (Rol, EstadoCuota...), utils
│  └─ ui/         # design system (shadcn/ui), tokens, componentes
├─ docs/
└─ db/            # schema.sql de referencia
```

## 5. Patrones transversales

- **Validación**: `zod` en `packages/shared` reutilizado en front (formularios) y API (pipe de validación) → una sola fuente de verdad.
- **Idempotencia**: webhooks de pago y creación de remesas usan claves de idempotencia.
- **Auditoría**: `AuditInterceptor` registra `quién/qué/cuándo/IP` en tabla `audit_log` para acciones sobre datos personales y pagos (requisito RGPD).
- **Errores**: filtro global → respuestas `{ code, message, details }` consistentes; nunca se filtran stack traces en producción.
- **Rate limiting**: `@nestjs/throttler` en login y recuperación.

## 6. Entornos

`local` → `staging` → `production`. Variables en `.env` validadas al arrancar; secretos en el gestor del proveedor (nunca en repo).
