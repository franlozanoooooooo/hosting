#!/bin/bash
# Arranca el servidor de desarrollo de la web.
# Requiere Node 22 y pnpm en el PATH (ver HANDOFF.md).
cd "$(dirname "$0")/../apps/web"
exec pnpm dev
