#!/bin/sh
set -e
echo "[entrypoint] Running database migrations..."
pnpm db:migrate
if [ "${SEED_DEMO_IF_EMPTY:-true}" != "false" ]; then
  echo "[entrypoint] Demo seed if catalog is empty (set SEED_DEMO_IF_EMPTY=false to skip)..."
  pnpm seed:demo || echo "[entrypoint] warning: seed:demo failed, continuing anyway"
fi
echo "[entrypoint] Starting API..."
exec "$@"
