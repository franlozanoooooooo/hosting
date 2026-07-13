# Club Atlético Antoniano — Plataforma Web + Intranet de Cantera

Plataforma web moderna para el Club Atlético Antoniano. Incluye:

1. **Web pública** del club (noticias, primer equipo, cantera, entradas, club, contacto).
2. **Intranet privada de cantera** (familias, coordinadores, entrenadores, administración).
3. **Gestión de pagos** con domiciliación SEPA recurrente (GoCardless) y pago puntual con tarjeta (Stripe) para entradas.
4. **Panel de administración** con control de roles (RBAC).

Referencia de inspiración (no copia): https://www.adalcorcon.com/ — tomamos su estructura informativa pero con una UI más moderna, rápida y accesible.

---

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend público + intranet | Next.js 15 (App Router), React 19, TailwindCSS, shadcn/ui |
| Backend / API | NestJS 11 (Node.js 22), REST + OpenAPI |
| Base de datos | PostgreSQL 16 |
| ORM | Prisma |
| Auth | JWT (access + refresh httpOnly), Argon2id |
| Almacenamiento | Supabase Storage (S3 compatible) |
| Pagos recurrentes SEPA | GoCardless (mandatos + suscripciones) |
| Pagos puntuales (entradas) | Stripe Checkout / Payment Intents |
| Email transaccional | Resend |
| Infra | Vercel (web) + Railway/Render (API + Postgres) o Docker en VPS |
| Observabilidad | Sentry + logs estructurados (pino) |

## Monorepo (pnpm + Turborepo)

```
club-atletico-antoniano/
├─ apps/
│  ├─ web/        → Next.js (público + intranet)
│  └─ api/        → NestJS (API REST)
├─ packages/
│  ├─ db/         → Prisma schema + cliente + migraciones
│  ├─ shared/     → DTOs, tipos, validaciones zod, enums de roles
│  └─ ui/         → componentes compartidos (shadcn/ui)
├─ docs/          → arquitectura, modelo de datos, UX, seguridad, despliegue, roadmap
└─ db/            → schema.sql de referencia + seed
```

## Documentación (entregables)

| # | Entregable | Documento |
|---|-----------|-----------|
| 1 | Arquitectura completa | [docs/01-arquitectura.md](docs/01-arquitectura.md) |
| 2 | Diseño UX/UI + Wireframes | [docs/03-ux-ui.md](docs/03-ux-ui.md) |
| 3 | Estructura de carpetas | [docs/01-arquitectura.md](docs/01-arquitectura.md) (§ Estructura) |
| 4 | Base de datos completa (ER + SQL) | [docs/02-modelo-datos.md](docs/02-modelo-datos.md) · [prisma/schema.prisma](prisma/schema.prisma) · [db/schema.sql](db/schema.sql) |
| 5 | Wireframes | [docs/03-ux-ui.md](docs/03-ux-ui.md) |
| 6 | Flujo de usuarios | [docs/03-ux-ui.md](docs/03-ux-ui.md) (§ Flujos) |
| 7 | Sistema de pagos | [docs/04-pagos.md](docs/04-pagos.md) |
| 8 | Plan de despliegue | [docs/06-despliegue.md](docs/06-despliegue.md) |
| 9 | Roadmap por fases | [docs/07-roadmap.md](docs/07-roadmap.md) |
| — | Seguridad y RGPD | [docs/05-seguridad-rgpd.md](docs/05-seguridad-rgpd.md) |
| 10 | Código inicial | `apps/`, `packages/` |

## Arranque rápido

```bash
pnpm install
cp .env.example .env            # rellenar credenciales
pnpm --filter @caa/db db:push   # crear esquema en Postgres
pnpm --filter @caa/db db:seed   # datos de ejemplo
pnpm dev                        # web (3000) + api (4000)
```
