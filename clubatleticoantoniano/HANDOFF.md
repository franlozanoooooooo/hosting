# 🤝 Guía de Handoff — Club Atlético Antoniano

Este documento explica cómo poner en marcha el proyecto desde cero y en qué estado está, para que cualquier persona pueda continuar el desarrollo.

---

## 1. Qué es esto

Monorepo (pnpm + Turborepo) con:

- **`apps/web`** — Web pública + intranet de familias + panel admin (Next.js 15, React 19, TailwindCSS 4).
- **`apps/api`** — API REST (NestJS 11) con auth JWT, RBAC y módulos de dominio.
- **`packages/db`** — Esquema Prisma + cliente + seed (PostgreSQL).
- **`packages/shared`** — Tipos, enums de roles y validaciones zod compartidas.
- **`docs/`** — Arquitectura, modelo de datos, UX/UI, pagos, seguridad/RGPD, despliegue y roadmap.

Visión general y enlaces a todo: [README.md](README.md).

---

## 2. Requisitos previos

| Herramienta | Versión | Notas |
|-------------|---------|-------|
| Node.js | **22 LTS** | https://nodejs.org (o `nvm install 22`) |
| pnpm | **9.x** | `corepack enable && corepack prepare pnpm@9 --activate` |
| PostgreSQL | **16** | Local, Docker, o un Postgres gestionado |

> ℹ️ En el equipo donde se generó esto no había Node instalado; se usó un binario portátil en `/tmp`. **En tu máquina instala Node 22 de forma normal.**

---

## 3. Arranque en local (paso a paso)

```bash
# 1. Instalar dependencias de todo el monorepo
pnpm install

# 2. Variables de entorno (copia y rellena)
cp .env.example .env

# 3. Base de datos: levanta un Postgres (opción rápida con Docker)
docker compose up -d   # Postgres en :5432 + Adminer en :8080
#   o usa tu propio Postgres y ajusta DATABASE_URL en .env

# 4. Crear el esquema y datos de ejemplo
pnpm --filter @caa/db db:push     # crea las tablas
pnpm --filter @caa/db db:seed     # datos de demo

# 5. Arrancar todo (web :3000 + api :4000)
pnpm dev
```

**Solo la web** (no necesita BD ni API; usa datos mock):

```bash
pnpm --filter @caa/web dev
# http://localhost:3000
```

### Credenciales de ejemplo (tras el seed)
- **Admin:** `admin@cantonioano.es` · `Antoniano2026!`
- **Familia:** DNI `12345678Z` · `Antoniano2026!`

---

## 4. Estado actual (qué está hecho y qué no)

### ✅ Hecho y funcionando
- **Web pública completa** (Inicio, Noticias, Primer Equipo, Cantera, Entradas, Club, Contacto) con datos mock — arranca y se ve sin backend.
- **Intranet de familia**: dashboard, pagos (tabla de cuotas + alta de mandato SEPA), documentos, comunicaciones, calendario (mock).
- **Estructura del panel admin**.
- **Fotos reales** del club optimizadas en `apps/web/public/images/` (hero + noticias). Crédito: **Raúl Pajares (@byraulpajares)**.
- **Botones "Comprar entrada"** → redirigen al proveedor oficial `https://antoniano.compralaentrada.com/` (URL centralizada en [apps/web/lib/links.ts](apps/web/lib/links.ts)).
- **Módulo de IA (Claude)** en `apps/api/src/modules/ia/`: 4 endpoints con el SDK oficial de Anthropic (modelo `claude-opus-4-8`):
  - `POST /api/ia/cronica` — genera crónica/noticia desde el resultado (admin/coord).
  - `POST /api/ia/comunicacion` — redacta avisos/convocatorias a familias.
  - `POST /api/ia/faq` — chatbot FAQ (público).
  - `POST /api/ia/documento/resumen` — resume/extrae datos de un PDF.
  - **Requiere `ANTHROPIC_API_KEY` en `.env`** (sin ella la API arranca igual, pero esos endpoints devuelven 503). Conseguir la clave en https://console.anthropic.com.
- **API NestJS**: módulos de auth (login DNI/email + JWT + refresh), jugadores (con scoping por rol), pagos (cuotas, remesas, mandatos), webhooks, auditoría. Guards RBAC e interceptor de auditoría.
- **Modelo de datos** completo en [prisma/schema.prisma](prisma/schema.prisma) (+ SQL de referencia en [db/schema.sql](db/schema.sql)).

### 🚧 Pendiente / con stubs (lo que toca seguir)
- **Conectar la web a la API real**: hoy las vistas usan `lib/mock-data.ts`. Sustituir por llamadas vía `lib/api.ts`.
- **Integración real de pagos**: `apps/api/src/modules/pagos/gocardless.service.ts` y los webhooks son stubs (`// TODO`). Falta el SDK real de GoCardless y Stripe, y las claves.
- **Protección de rutas en el front**: los layouts de `/intranet` y `/admin` tienen comentarios `TODO`/`SEGURIDAD` indicando dónde añadir la comprobación de sesión/rol en servidor (middleware o `cookies()` + `/auth/me`).
- **Generación de recibos PDF** y subida de documentos a storage (S3/Supabase).
- **Migraciones Prisma** versionadas (`prisma migrate dev`) — ahora se usa `db:push`.
- **Tests** y CI/CD (workflow descrito en [docs/06-despliegue.md](docs/06-despliegue.md)).

### Más fotos
- Se descargaron y optimizaron 12 fotos de las ~500 compartidas. Para añadir más: descárgalas de Drive a `apps/web/public/images/`, redimensiónalas a ~1920px (hay un patrón con `sharp`), y referencia la ruta `/images/...`.

---

## 5. Roadmap y siguientes pasos sugeridos

Ver [docs/07-roadmap.md](docs/07-roadmap.md). Orden recomendado para quien continúe:

1. Levantar Postgres + `db:push` + `db:seed` y verificar el login real contra la API.
2. Conectar el dashboard de familia a la API (jugadores + cuotas reales).
3. Integrar GoCardless (sandbox) para el alta de mandato SEPA de punta a punta.
4. Añadir la protección de rutas (middleware de sesión) en `/intranet` y `/admin`.
5. CI/CD + despliegue (Vercel + Railway), según [docs/06-despliegue.md](docs/06-despliegue.md).

---

## 6. Comandos útiles

```bash
pnpm dev                              # web + api en paralelo (Turborepo)
pnpm --filter @caa/web dev            # solo web
pnpm --filter @caa/api dev            # solo api
pnpm --filter @caa/db db:studio       # explorar la BD (Prisma Studio)
pnpm --filter @caa/db db:migrate      # crear una migración
pnpm build                            # build de todo
pnpm typecheck                        # type-check de todo
```

---

## 7. Notas

- **Decisiones de arquitectura** (por qué GoCardless + Stripe, ORM, etc.) están justificadas en `docs/`.
- **Datos sensibles de menores**: leer [docs/05-seguridad-rgpd.md](docs/05-seguridad-rgpd.md) antes de tocar producción.
- **El ZIP de entrega no incluye `node_modules`** — ejecuta `pnpm install` tras descomprimir.
