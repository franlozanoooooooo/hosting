# 06 · Plan de despliegue (Entregable)

> Autor: Arquitecto Full Stack + PM · Revisado por Seguridad/RGPD, Pagos y DevOps.
> Monorepo pnpm + Turborepo: `apps/web` (Next.js 15), `apps/api` (NestJS 11), `packages/db` (Prisma), `packages/shared`, `packages/ui`. BD PostgreSQL.

## 1. Entornos y estrategia de ramas

### 1.1 Entornos

| Entorno | Propósito | Web | API + BD | Datos | Acceso |
|---|---|---|---|---|---|
| **local** | Desarrollo diario | `localhost:3000` | `localhost:3001` + Postgres en Docker | Seed sintético (sin PII real) | Desarrolladores |
| **staging** | Preproducción, QA, demos, pruebas de webhooks en *sandbox* | `staging.cantonioano.es` | API + BD gestionada (plan pequeño) | Datos sintéticos / anonimizados | Equipo + cliente |
| **production** | Servicio real | `cantonioano.es` / `www` | API + BD gestionada (HA) | PII real, pagos reales | Público + staff |

> Regla RGPD: **nunca** copiar datos de production a staging/local sin anonimizar. Existe un script `pnpm db:anonymize` para volcados saneados.

### 1.2 Estrategia de ramas — *trunk-based* ligero

Recomendado por el tamaño del equipo (2–4 personas) y por habilitar despliegue continuo.

- `main` es la **única rama de larga vida** y siempre desplegable.
- Trabajo en **ramas cortas** `feat/*`, `fix/*`, `chore/*` (vida < 2–3 días) → PR → revisión + CI verde → *squash merge* a `main`.
- **Promoción por entorno**:
  - Merge a `main` → CI/CD despliega automáticamente a **staging**.
  - **Producción** se despliega creando un **tag SemVer** (`v1.2.0`) o vía aprobación manual del *environment* `production` en GitHub Actions (*release gate*).
- *Hotfix*: rama `fix/*` desde `main`, *fast-track* de revisión, tag de *patch* (`v1.2.1`).
- *Feature flags* (variable de entorno o tabla `feature_flags`) para fusionar trabajo incompleto sin exponerlo.

```
feat/intranet-pagos ──┐
fix/login-cookie    ──┤  PR + CI  ─► main ──(auto)──► staging ──(tag/aprobación)──► production
chore/deps          ──┘                     │
                                            └─ preview deploy por PR (Vercel)
```

## 2. Hosting recomendado

### 2.1 Opciones

| Pieza | Opción A (recomendada) | Opción B | Opción C (autogestión) |
|---|---|---|---|
| Web Next.js | **Vercel** | Vercel | Coolify/Docker en VPS |
| API NestJS | **Railway** | Render | Coolify/Docker en VPS |
| PostgreSQL | **Railway Postgres** | Render Postgres / Neon / Supabase | Postgres en el VPS |

**Web — Vercel** (en todas las opciones). Es el hosting nativo de Next.js 15: *preview deployments* por PR, ISR/SSG, CDN global y *edge* sin configuración. Soporta monorepos (*Root Directory* = `apps/web`).

**API + BD:**

- **Railway (recomendado)** — *Pros*: DX excelente, Postgres gestionado en el mismo proyecto, redes privadas entre servicios, *deploy* desde Dockerfile o Nixpacks, escalado sencillo, backups. *Contras*: coste por uso puede crecer; región EU disponible pero menos opciones que hyperscalers.
- **Render** — *Pros*: planes claros, Postgres gestionado con PITR, *cron jobs* nativos, región Frankfurt. *Contras*: cold starts en planes bajos; UI algo menos ágil.
- **VPS (Hetzner/DigitalOcean) + Coolify + Docker Compose** — *Pros*: coste fijo bajo, control total, datos en EU (Hetzner Falkenstein/Núremberg, ideal RGPD). *Contras*: tú gestionas backups, parches, SSL, alta disponibilidad y on-call. Más carga operativa.

### 2.2 Recomendación

**Vercel (web) + Railway (API + PostgreSQL), región EU (Frankfurt/Ámsterdam).**
Minimiza la carga operativa para un equipo pequeño, mantiene los datos en la UE (requisito RGPD) y permite *time-to-market* rápido. Si el coste mensual supera el umbral previsto o se requiere soberanía total del dato, se migra a la **Opción C (Hetzner + Coolify)**: el `docker-compose.yml` y los Dockerfiles ya quedan preparados para ello (ver §9 y abajo), de modo que la migración es de bajo riesgo.

> Dockerfiles previstos: `apps/api/Dockerfile` (build multi-stage, `node:22-alpine`, `pnpm deploy --filter api`) y `apps/web/Dockerfile` (output `standalone` de Next.js). Esto evita el *lock-in* y habilita la Opción C.

## 3. Variables de entorno por servicio

> Todas las variables se validan al arrancar con `zod` en `apps/api/src/config` y en `apps/web/lib/env`. Los secretos viven en el gestor del proveedor (Vercel/Railway env vars o el `.env` cifrado del VPS), **nunca** en el repositorio. Solo las `NEXT_PUBLIC_*` se exponen al navegador.

### 3.1 API (NestJS)

| Variable | Descripción |
|---|---|
| `NODE_ENV` | `development` \| `staging` \| `production`. |
| `PORT` | Puerto de escucha de la API (ej. `3001`). |
| `DATABASE_URL` | Cadena de conexión PostgreSQL (`postgresql://user:pass@host:5432/db?sslmode=require`). Usada por Prisma. |
| `DIRECT_URL` | Conexión directa (sin *pooler*) para `prisma migrate`. Necesaria si se usa pgBouncer/pooler. |
| `JWT_ACCESS_SECRET` | Secreto de firma del *access token* (15 min). 32+ bytes aleatorios. |
| `JWT_REFRESH_SECRET` | Secreto de firma del *refresh token* (7 días, rotativo). Distinto del anterior. |
| `JWT_ACCESS_TTL` | TTL del access token (ej. `15m`). |
| `JWT_REFRESH_TTL` | TTL del refresh token (ej. `7d`). |
| `COOKIE_DOMAIN` | Dominio de las cookies `httpOnly` (ej. `.cantonioano.es`). |
| `CORS_ORIGINS` | Orígenes permitidos, separados por coma (ej. `https://cantonioano.es,https://www.cantonioano.es`). |
| `GOCARDLESS_ACCESS_TOKEN` | Token de acceso a la API de GoCardless (SEPA recurrente). *Sandbox* en staging, *live* en producción. |
| `GOCARDLESS_ENVIRONMENT` | `sandbox` \| `live`. |
| `GOCARDLESS_WEBHOOK_SECRET` | Secreto para verificar la firma `Webhook-Signature` (HMAC-SHA256) de GoCardless. |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (`sk_test_*` / `sk_live_*`) para venta de entradas. |
| `STRIPE_WEBHOOK_SECRET` | Secreto de verificación de firma del *endpoint* de webhooks Stripe (`whsec_*`). |
| `STORAGE_PROVIDER` | `supabase` \| `s3`. |
| `SUPABASE_URL` | URL del proyecto Supabase (si `STORAGE_PROVIDER=supabase`). |
| `SUPABASE_SERVICE_ROLE_KEY` | *Service role key* de Supabase (solo servidor; nunca al cliente). |
| `S3_ENDPOINT` | *Endpoint* S3/compatible (si `STORAGE_PROVIDER=s3`). |
| `S3_REGION` | Región del bucket. |
| `S3_BUCKET` | Nombre del bucket (documentos, justificantes, imágenes). |
| `S3_ACCESS_KEY_ID` | Credencial de acceso S3. |
| `S3_SECRET_ACCESS_KEY` | Credencial secreta S3. |
| `RESEND_API_KEY` | API key de Resend para email transaccional (`re_*`). |
| `EMAIL_FROM` | Remitente verificado (ej. `Club Atlético Antoniano <noreply@cantonioano.es>`). |
| `SENTRY_DSN` | DSN de Sentry para captura de errores del backend. |
| `LOG_LEVEL` | Nivel de pino (`info` en prod, `debug` en local). |
| `RATE_LIMIT_TTL` / `RATE_LIMIT_MAX` | Configuración de `@nestjs/throttler` para login y recuperación. |
| `APP_PUBLIC_URL` | URL pública de la web (para enlaces en emails). |

### 3.2 Web (Next.js)

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL pública de la API (ej. `https://api.cantonioano.es`). Expuesta al navegador. |
| `NEXT_PUBLIC_SITE_URL` | URL canónica del sitio (SEO, *sitemap*, *canonical*). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave publicable de Stripe (`pk_test_*` / `pk_live_*`) para Stripe.js / Checkout. |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN de Sentry del frontend. |
| `INTERNAL_API_URL` | URL interna API para el BFF/Route Handlers (red privada en Railway; evita salir a internet). |
| `REVALIDATE_TOKEN` | Token para invalidación de ISR (on-demand revalidation) desde el CMS de noticias. |

> Las claves *secretas* de Stripe/GoCardless/Resend/S3 **solo** existen en la API. La web nunca las recibe.

## 4. CI/CD — GitHub Actions

### 4.1 Jobs del pipeline

1. **install** — *checkout*, `pnpm install --frozen-lockfile`, caché de store de pnpm y de Turborepo.
2. **lint** — `pnpm turbo lint` (ESLint + Prettier check).
3. **typecheck** — `pnpm turbo typecheck` (tsc `--noEmit`).
4. **test** — `pnpm turbo test` (Jest API + Vitest web) contra un Postgres de servicio efímero; sube cobertura.
5. **build** — `pnpm turbo build` (genera Prisma Client, compila API y web). Valida que todo compila antes de desplegar.
6. **migrate** *(solo en CD, tras merge a `main` / tag)* — `pnpm --filter db prisma migrate deploy` contra la BD del entorno. Aplica migraciones pendientes de forma idempotente.
7. **deploy-staging** *(en push a `main`)* — despliega API a Railway (`railway up`) y la web a Vercel (`vercel deploy --prebuilt`). Lanza *smoke test* de `/health`.
8. **deploy-production** *(en tag `v*` o aprobación del *environment* `production`)* — mismo flujo contra el entorno de producción, con *gate* manual.

> La web la puede desplegar también la integración nativa de Vercel↔GitHub (preview por PR + producción por `main`). El workflow de abajo muestra el control explícito para mantener la promoción coordinada con las migraciones.

### 4.2 Ejemplo de workflow (`.github/workflows/ci-cd.yml`)

```yaml
name: CI/CD

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  PNPM_VERSION: 9
  NODE_VERSION: 22

jobs:
  verify:
    name: Lint · Typecheck · Test · Build
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: caa_test
        ports: ['5432:5432']
        options: >-
          --health-cmd "pg_isready -U test"
          --health-interval 10s --health-timeout 5s --health-retries 5
    env:
      DATABASE_URL: postgresql://test:test@localhost:5432/caa_test
      DIRECT_URL: postgresql://test:test@localhost:5432/caa_test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: '${{ env.PNPM_VERSION }}' }
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter db prisma generate
      - run: pnpm turbo run lint typecheck
      - run: pnpm --filter db prisma migrate deploy   # prepara la BD de test
      - run: pnpm turbo run test
      - run: pnpm turbo run build

  deploy-staging:
    name: Deploy staging
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: verify
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: '${{ env.PNPM_VERSION }}' }
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}', cache: pnpm }
      - run: pnpm install --frozen-lockfile

      # 1) Migraciones de BD (idempotentes)
      - name: Prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
          DIRECT_URL: ${{ secrets.STAGING_DIRECT_URL }}
        run: pnpm --filter db prisma migrate deploy

      # 2) API → Railway
      - name: Deploy API (Railway)
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN_STAGING }}
        run: |
          npm i -g @railway/cli
          railway up --service api --detach

      # 3) Web → Vercel
      - name: Deploy Web (Vercel)
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: |
          npm i -g vercel
          vercel pull --yes --environment=preview --token=$VERCEL_TOKEN
          vercel build --token=$VERCEL_TOKEN
          vercel deploy --prebuilt --token=$VERCEL_TOKEN

      # 4) Smoke test
      - name: Smoke test API
        run: curl -fsS https://api.staging.cantonioano.es/health

  deploy-production:
    name: Deploy production
    if: startsWith(github.ref, 'refs/tags/v')
    needs: verify
    runs-on: ubuntu-latest
    environment: production        # requiere aprobación manual (release gate)
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: '${{ env.PNPM_VERSION }}' }
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}', cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - name: Prisma migrate deploy (prod)
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
          DIRECT_URL: ${{ secrets.PROD_DIRECT_URL }}
        run: pnpm --filter db prisma migrate deploy
      - name: Deploy API (Railway prod)
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN_PROD }}
        run: |
          npm i -g @railway/cli
          railway up --service api --environment production --detach
      - name: Deploy Web (Vercel prod)
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: |
          npm i -g vercel
          vercel pull --yes --environment=production --token=$VERCEL_TOKEN
          vercel build --prod --token=$VERCEL_TOKEN
          vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
      - name: Smoke test API
        run: curl -fsS https://api.cantonioano.es/health
```

## 5. Base de datos

- **Migraciones**: durante el desarrollo, `prisma migrate dev` genera migraciones en `packages/db/prisma/migrations`. En CD se aplican con **`prisma migrate deploy`** (idempotente, sin *prompts*, solo aplica pendientes). Las migraciones se versionan en Git y se revisan en PR.
- **Orden seguro**: las migraciones se ejecutan **antes** de desplegar el código que las necesita. Para cambios destructivos se usa **expand → migrate datos → contract** en dos *releases* para evitar caídas.
- **Conexiones**: en producción se usa un *pooler* (pgBouncer / Railway pooler) vía `DATABASE_URL`; las migraciones usan `DIRECT_URL` (conexión directa).
- **Backups automáticos**:
  - Railway/Render realizan *snapshots* automáticos diarios. Se configura **retención ≥ 30 días**.
  - Backup lógico adicional: `pg_dump` cifrado **diario** vía *cron job* del proveedor, subido a bucket S3 en EU con versionado y *lifecycle* (90 días).
- **Point-in-time recovery (PITR)**: activar el plan con WAL/PITR (Railway Pro, Render, Neon o Supabase) con ventana de **7 días** para producción. Permite restaurar a cualquier segundo dentro de la ventana (clave ante borrados accidentales o incidentes).
- **Prueba de restauración**: ensayo de *restore* **trimestral** sobre un entorno temporal, documentado en el *runbook*.

## 6. Dominios, DNS, SSL, CDN y webhooks

### 6.1 Dominios y DNS

| Host | Apunta a | Uso |
|---|---|---|
| `cantonioano.es`, `www.cantonioano.es` | Vercel | Web pública + intranet/admin |
| `api.cantonioano.es` | Railway (API) | API REST + webhooks |
| `staging.cantonioano.es` / `api.staging.cantonioano.es` | Vercel / Railway | Preproducción |

- DNS gestionado en el registrador (o Cloudflare). Registros `A`/`CNAME` según indique cada proveedor; `www` → `apex` con redirección 308.
- **SSL/TLS**: certificados automáticos (Let's Encrypt) gestionados por Vercel y Railway; renovación automática. HSTS activado.
- **CDN**: la web se sirve por la *edge network* de Vercel (ISR/SSG cacheado). Opcional Cloudflare delante para WAF y *caching* extra. La API **no** se cachea (datos privados); `Cache-Control: no-store` en respuestas autenticadas.

### 6.2 Webhooks de pagos (apuntan a la API)

| Proveedor | URL pública (producción) | Verificación |
|---|---|---|
| GoCardless | `https://api.cantonioano.es/webhooks/gocardless` | Cabecera `Webhook-Signature` (HMAC-SHA256 con `GOCARDLESS_WEBHOOK_SECRET`) |
| Stripe | `https://api.cantonioano.es/webhooks/stripe` | Firma `Stripe-Signature` verificada con `STRIPE_WEBHOOK_SECRET` |

- En **staging** se usan los *endpoints* equivalentes en `api.staging.cantonioano.es` con credenciales *sandbox*.
- En **local** se exponen con `stripe listen --forward-to localhost:3001/webhooks/stripe` y un túnel (ngrok/cloudflared) para GoCardless.
- Todos los webhooks son **idempotentes** (clave de evento almacenada en `webhook_events`) y responden `2xx` rápido, procesando en segundo plano.

## 7. Observabilidad

- **Errores — Sentry** en API (`@sentry/nestjs`) y web (`@sentry/nextjs`): captura de excepciones, *source maps*, *release tracking* (tag por *deploy*), *performance tracing* básico. PII filtrada (`beforeSend` elimina datos personales).
- **Logs estructurados — pino** en NestJS (`nestjs-pino`): JSON con `requestId`, `userId` (hasheado), `route`, latencia. En producción `LOG_LEVEL=info`; nunca se loguean secretos ni tokens. Recolección por el *log drain* del proveedor (Railway logs / Logtail / Better Stack).
- **Uptime monitoring**: chequeo externo (Better Stack / UptimeRobot) sobre `https://api.cantonioano.es/health` y la home cada 1–5 min, multi-región.
- **Health checks**: endpoint `/health` (`@nestjs/terminus`) que verifica BD y dependencias críticas; usado por el proveedor para *readiness/liveness*.
- **Alertas** (a email + canal del equipo):
  - Caída de uptime o `/health` no `200`.
  - Tasa de errores 5xx > umbral (Sentry).
  - **Fallo de webhook de pago** o remesa SEPA rechazada → alerta prioritaria.
  - Pico de latencia de BD o conexiones agotadas.
- **Auditoría**: la tabla `audit_log` (RGPD) complementa los logs operativos y es consultable desde el panel admin.

## 8. Checklist de salida a producción (go-live)

**Infraestructura y dominio**
- [ ] Dominios `cantonioano.es`, `www`, `api` configurados con SSL válido y HSTS.
- [ ] DNS propagado; redirección `www`↔apex correcta.
- [ ] Variables de entorno de producción cargadas y validadas (zod) en API y web.
- [ ] Pooler y `DIRECT_URL` configurados; `migrate deploy` ejecutado y al día.

**Pagos**
- [ ] GoCardless en modo **live**; mandato de prueba real verificado y cancelado.
- [ ] Stripe en modo **live**; compra de entrada de prueba realizada y reembolsada.
- [ ] Webhooks GoCardless y Stripe registrados a URLs de producción y firma verificada.
- [ ] Idempotencia de webhooks probada (reenvío de evento no duplica efectos).

**Seguridad y RGPD**
- [ ] Cookies `httpOnly`/`Secure`/`SameSite`; CORS restringido a dominios propios.
- [ ] Rate limiting activo en login/recuperación.
- [ ] Política de privacidad, aviso de cookies y registro de consentimientos operativos.
- [ ] Encargados de tratamiento (Vercel, Railway, Stripe, GoCardless, Resend, Sentry) documentados en EU/con garantías.
- [ ] Datos de production no replicados sin anonimizar.

**Datos y resiliencia**
- [ ] Backups automáticos activos (retención ≥ 30 días) + `pg_dump` cifrado diario.
- [ ] PITR activado (ventana 7 días) y **restauración de prueba** realizada con éxito.
- [ ] Seed de producción mínimo cargado (roles, categorías, equipos).

**Observabilidad y operación**
- [ ] Sentry recibiendo eventos (web + API) con *release tagging*.
- [ ] Uptime monitor y alertas configurados y probados (alerta de prueba recibida).
- [ ] Logs estructurados llegando al *drain*.
- [ ] *Runbook* de incidentes y rollback documentado; contacto on-call definido.

**Calidad**
- [ ] CI verde en `main`; *smoke tests* post-deploy pasan.
- [ ] Email transaccional (Resend) entregando desde dominio verificado (SPF/DKIM/DMARC).
- [ ] Plan de **rollback** ensayado (tag anterior + migración *contract* reversible).

## 9. `docker-compose.yml` de desarrollo local (postgres + adminer)

> Ubicación sugerida: raíz del repo. La API y la web se ejecutan con `pnpm dev` fuera de Docker; este compose solo levanta las dependencias de infraestructura locales.

```yaml
# docker-compose.yml — entorno de desarrollo local
services:
  postgres:
    image: postgres:16-alpine
    container_name: caa_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: caa
      POSTGRES_PASSWORD: caa_dev
      POSTGRES_DB: caa_dev
    ports:
      - '5432:5432'
    volumes:
      - caa_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U caa -d caa_dev']
      interval: 10s
      timeout: 5s
      retries: 5

  adminer:
    image: adminer:4
    container_name: caa_adminer
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - '8080:8080'
    environment:
      ADMINER_DEFAULT_SERVER: postgres
      ADMINER_DESIGN: pepa-linha-dark

volumes:
  caa_pgdata:
```

`DATABASE_URL` local correspondiente:

```
DATABASE_URL="postgresql://caa:caa_dev@localhost:5432/caa_dev?schema=public"
```

Arranque:

```bash
docker compose up -d           # levanta postgres + adminer
pnpm --filter db prisma migrate dev
pnpm --filter db prisma db seed
pnpm dev                       # turbo: web (3000) + api (3001)
# Adminer: http://localhost:8080  (server: postgres, user: caa)
```
