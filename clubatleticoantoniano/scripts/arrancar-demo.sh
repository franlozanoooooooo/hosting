#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# Arranca TODO para la demo del Club Atlético Antoniano:
#   1. PostgreSQL (portátil, datos en ~/.caa-dev/pgdata)
#   2. API NestJS  → http://localhost:4000/api
#   3. Web Next.js → http://localhost:3000
#
# Uso:  ./scripts/arrancar-demo.sh
# Parar: ./scripts/arrancar-demo.sh stop
# ─────────────────────────────────────────────────────────────────
set -e

CAA_DEV="$HOME/.caa-dev"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$CAA_DEV/node22/bin:$PATH"

if [ "$1" = "stop" ]; then
  echo "⏹  Parando servicios..."
  kill $(lsof -nP -iTCP:3000 -sTCP:LISTEN -t 2>/dev/null) 2>/dev/null || true
  kill $(lsof -nP -iTCP:4000 -sTCP:LISTEN -t 2>/dev/null) 2>/dev/null || true
  "$CAA_DEV/pg16/bin/pg_ctl" -D "$CAA_DEV/pgdata" stop 2>/dev/null || true
  echo "✅ Todo parado."
  exit 0
fi

echo "🐘 1/3 PostgreSQL..."
if ! lsof -nP -iTCP:5432 -sTCP:LISTEN >/dev/null 2>&1; then
  "$CAA_DEV/pg16/bin/pg_ctl" -D "$CAA_DEV/pgdata" -l "$CAA_DEV/pg.log" -o "-p 5432" start
else
  echo "   (ya estaba corriendo)"
fi

echo "🚀 2/3 API (puerto 4000)..."
if ! lsof -nP -iTCP:4000 -sTCP:LISTEN >/dev/null 2>&1; then
  (cd "$REPO" && nohup pnpm --filter @caa/api dev > /tmp/caa-api.log 2>&1 &)
  for i in $(seq 1 30); do
    sleep 1
    curl -s -o /dev/null http://localhost:4000/api/auth/me 2>/dev/null && break
  done
else
  echo "   (ya estaba corriendo)"
fi

echo "🌐 3/3 Web (puerto 3000)..."
if ! lsof -nP -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
  (cd "$REPO/apps/web" && nohup node node_modules/next/dist/bin/next dev -p 3000 > /tmp/caa-web.log 2>&1 &)
  sleep 4
else
  echo "   (ya estaba corriendo)"
fi

echo ""
echo "✅ Demo lista:"
echo "   Web:    http://localhost:3000"
echo "   API:    http://localhost:4000/api"
echo "   Admin:  admin@cantonioano.es · Antoniano2026!"
echo ""
echo "   Logs: /tmp/caa-api.log · /tmp/caa-web.log"
