# ─────────────────────────────────────────────────────────────────
# API NestJS (@caa/api) para Railway/Docker.
# La web (apps/web) se despliega aparte (Netlify/Vercel) — este
# contenedor solo sirve la API y aplica el esquema Prisma al arrancar.
# ─────────────────────────────────────────────────────────────────
FROM node:22-slim AS base
# OpenSSL para los engines de Prisma.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

# ── Dependencias (capa cacheable: solo manifiestos) ──
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
# Solo la API y sus dependencias de workspace (db, shared), con devDeps
# (hacen falta @nestjs/cli, prisma y typescript para compilar).
RUN pnpm install --frozen-lockfile --prod=false --filter "@caa/api..."

# ── Compilación ──
FROM deps AS build
COPY prisma ./prisma
COPY packages/db ./packages/db
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN pnpm --filter @caa/db db:generate && pnpm --filter @caa/api build
# Los paquetes del workspace apuntan a TS (src/index.ts), válido en dev pero
# no en producción: se compilan a JS y se redirige su `main` al compilado.
RUN pnpm --filter @caa/shared exec tsc src/index.ts --outDir dist --rootDir src \
      --module commonjs --moduleResolution node --target es2022 --esModuleInterop --skipLibCheck \
 && pnpm --filter @caa/db exec tsc src/index.ts --outDir dist --rootDir src \
      --module commonjs --moduleResolution node --target es2022 --esModuleInterop --skipLibCheck --types node \
 && cd packages/shared && npm pkg set main=./dist/index.js && cd ../db && npm pkg set main=./dist/index.js \
 && test -f /app/packages/shared/dist/index.js && test -f /app/packages/db/dist/index.js

# ── Runtime ──
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 4000
# Aplica el esquema a la BD (idempotente) y arranca la API.
# Cuando haya migraciones versionadas: sustituir db push por migrate deploy.
CMD ["sh", "-c", "pnpm --filter @caa/db exec prisma db push --skip-generate && node apps/api/dist/main.js"]
