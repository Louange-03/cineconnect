#!/bin/sh
set -e
echo "[entrypoint] Running database migrations..."
pnpm db:migrate
if [ "${SEED_DEMO_IF_EMPTY:-true}" != "false" ]; then
  echo "[entrypoint] Demo seed — ajoute les titres démo manquants (SEED_DEMO_IF_EMPTY=false pour désactiver)..."
  pnpm seed:demo || echo "[entrypoint] warning: seed:demo failed, continuing anyway"
fi
if [ "${SEED_OMDB_ON_START:-true}" != "false" ]; then
  if [ -n "${OMDB_API_KEY:-}" ] || [ -n "${OMDB_KEY:-}" ]; then
    echo "[entrypoint] OMDb seed — catalogue étendu comme en local (clé présente)..."
    pnpm seed:omdb || echo "[entrypoint] warning: seed:omdb failed, continuing anyway"
  else
    echo "[entrypoint] Pas de OMDB_API_KEY — catalogue limité au seed démo. Définis la clé pour importer la liste OMDb (comme en local)."
  fi
fi
if [ "${SEED_TMDB_ON_START:-true}" != "false" ]; then
  if [ -n "${TMDB_API_KEY:-}" ]; then
    echo "[entrypoint] TMDB seed — import des films populaires (clé présente)..."
    pnpm seed:tmdb || echo "[entrypoint] warning: seed:tmdb failed, continuing anyway"
  else
    echo "[entrypoint] Pas de TMDB_API_KEY — import TMDB ignoré."
  fi
fi
echo "[entrypoint] Starting API..."
exec "$@"
