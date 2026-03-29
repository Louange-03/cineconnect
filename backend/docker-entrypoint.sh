#!/bin/sh
set -e
echo "[entrypoint] Running database migrations..."
pnpm db:migrate
echo "[entrypoint] Starting API..."
exec "$@"
