#!/usr/bin/env bash
# Genera la versión estática de la web (apps/web/out/) y un zip listo para
# ARRASTRAR a la pestaña Deploys de Netlify (despliegue manual, sin build).
#
# Uso: ./scripts/exportar-estatico.sh
# Resultado: antoniano-web-estatica-<fecha>.zip en la raíz del proyecto.
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$RAIZ/apps/web"

# 1. Build estática. El middleware no existe en un export estático, así que
#    se aparta durante la build y se restaura siempre al salir.
if [ -f "$WEB/middleware.ts" ]; then
  mv "$WEB/middleware.ts" "$WEB/middleware.ts.off"
  trap 'mv "$WEB/middleware.ts.off" "$WEB/middleware.ts"' EXIT
fi
STATIC_EXPORT=1 pnpm --filter @caa/web build

# 2. Elimina del resultado las rutas ocultas (zona privada): páginas HTML
#    y también sus chunks JS, que quedarían huérfanos.
cd "$WEB/out"
rm -rf login recuperar intranet admin cantera/alta
rm -rf "_next/static/chunks/app/(auth)" \
       "_next/static/chunks/app/(public)/cantera/alta" \
       _next/static/chunks/app/intranet \
       _next/static/chunks/app/admin

# 3. Reglas de redirección que en la app dinámica cubre el middleware.
#    Netlify las aplica también en despliegues manuales.
cat > _redirects <<'REGLAS'
/login/*          /   302
/login            /   302
/recuperar/*      /   302
/recuperar        /   302
/intranet/*       /   302
/intranet         /   302
/admin/*          /   302
/admin            /   302
/cantera/alta/*   /   302
/cantera/alta     /   302
/primer-equipo    /   302
REGLAS

# 4. Zip con el contenido del sitio en la raíz (el formato que espera Netlify).
FECHA="$(date +%Y%m%d)"
ZIP="$RAIZ/antoniano-web-estatica-$FECHA.zip"
rm -f "$RAIZ"/antoniano-web-estatica-*.zip
if command -v zip >/dev/null; then
  zip -qr "$ZIP" .
else
  python3 -m zipfile -c "$ZIP" .
fi
echo "Zip listo para Netlify Deploys: $ZIP"
