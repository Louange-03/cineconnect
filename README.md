# CineConnect

Plateforme web full stack pour decouvrir des films, les noter et discuter en temps reel entre utilisateurs.

## Fonctionnalites

- Authentification JWT: inscription, connexion, session utilisateur.
- Catalogue films: listing, details, categories, recherche.
- Import OMDb: recherche externe et ajout de films dans le catalogue local.
- Avis/notes: creation, edition, suppression des reviews.
- Social: gestion des amis.
- Messagerie: conversations, messages, evenements temps reel (Socket.io).
- Documentation API: Swagger UI et document OpenAPI JSON.

## Stack

- Frontend: React, TypeScript, Vite, TanStack Router, TanStack Query, Tailwind CSS.
- Backend: Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL, Socket.io.
- Outillage: pnpm workspace, Vitest, Supertest.

## Structure du monorepo

```text
/
├─ frontend/    # app React
├─ backend/     # API Express + DB + Swagger + Socket
├─ shared/      # types/artefacts partages
├─ docs/        # rapport, schema
└─ scripts/     # scripts utilitaires
```

## Prerequis

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+ (ou Docker)

## Installation locale

```bash
git clone https://github.com/Louange-03/cineconnect.git
cd cineconnect
pnpm install
```

### Variables d'environnement

#### Backend (`backend/.env`)

```env
PORT=3007
DATABASE_URL=postgresql://cineconnect:cineconnect@localhost:5437/cineconnect
JWT_SECRET=change_this_secret_min_32_chars
FRONTEND_URL=http://localhost:5173

OMDB_API_KEY=your_omdb_key
# OMDB_KEY=your_omdb_key   # alias supporte
PASSWORD_RESET_EMAIL_SUBJECT=Reinitialisation du mot de passe
PASSWORD_RESET_TOKEN_TTL_MINUTES=30
PASSWORD_RESET_DEV_RETURN_LINK=false
MAIL_PROVIDER=mailgun

MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=mg.your-domain.com
MAILGUN_FROM=CineConnect <postmaster@mg.your-domain.com>
# EU: https://api.eu.mailgun.net
# US: https://api.mailgun.net
MAILGUN_BASE_URL=https://api.mailgun.net
```

#### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3007
VITE_SOCKET_URL=http://localhost:3007
```

## Base de donnees

Si vous utilisez Docker:

```bash
docker compose up -d db
pnpm --dir backend db:migrate
```

Adminer est expose sur `http://localhost:8080`.

## Lancer en developpement

```bash
pnpm dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3007`
- Swagger UI: `http://localhost:3007/api/docs`
- OpenAPI JSON: `http://localhost:3007/api/docs-json`

## Scripts utiles

Depuis la racine:

- `pnpm dev` - lance front + back
- `pnpm test` - lance les tests backend puis frontend
- `pnpm test:coverage` - tests + couverture (seuils 100% sur le perimetre configure)

Checks package:

- `pnpm --dir backend typecheck`
- `pnpm --dir backend test:coverage` (demande PostgreSQL local : `docker compose up -d db` puis `pnpm --dir backend db:migrate`)
- `pnpm --dir frontend typecheck`
- `pnpm --dir frontend build`
- `pnpm --dir frontend test:coverage`

## Deploiement Cloud Run (guide pratique)

Le depot est configure pour un deploiement Cloud Run via deux conteneurs:

- `backend/Dockerfile` pour l'API Express
- `frontend/Dockerfile` pour l'application React (statique)

### Prerequis GCP

- Activer APIs: Cloud Run, Cloud Build, Artifact Registry.
- Avoir un projet GCP + `gcloud` configure:
  - `gcloud auth login`
  - `gcloud config set project <PROJECT_ID>`

### 1) Deployer le backend sur Cloud Run

Construire et publier l'image:

```bash
gcloud builds submit --config cloudbuild.backend.yaml
```

Deployer le service:

```bash
gcloud run deploy cineconnect-api \
  --image gcr.io/<PROJECT_ID>/cineconnect-api \
  --platform managed \
  --region <REGION> \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-env-vars FRONTEND_URL=https://<FRONTEND_CLOUD_RUN_URL> \
  --set-env-vars DATABASE_URL=postgresql://<...> \
  --set-env-vars JWT_SECRET=<SECRET> \
  --set-env-vars OMDB_API_KEY=<OMDB_KEY> \
  --set-env-vars MAIL_PROVIDER=mailgun \
  --set-env-vars MAILGUN_API_KEY=<...> \
  --set-env-vars MAILGUN_DOMAIN=<...> \
  --set-env-vars MAILGUN_FROM=<...> \
  --set-env-vars MAILGUN_BASE_URL=https://api.eu.mailgun.net \
  --set-env-vars PASSWORD_RESET_TOKEN_TTL_MINUTES=30 \
  --set-env-vars PASSWORD_RESET_EMAIL_SUBJECT="Reinitialisation du mot de passe" \
  --set-env-vars PASSWORD_RESET_DEV_RETURN_LINK=false
```

Verifier:

- `GET /health`
- `GET /api/docs-json`

### 2) Deployer le frontend sur Cloud Run

Le frontend lit `VITE_API_URL` et `VITE_SOCKET_URL` au build.

Construire et publier l'image:

```bash
gcloud builds submit \
  --config cloudbuild.frontend.yaml \
  --substitutions _VITE_API_URL=https://<API_CLOUD_RUN_URL>,_VITE_SOCKET_URL=https://<API_CLOUD_RUN_URL>
```

Deployer le service:

```bash
gcloud run deploy cineconnect-web \
  --image gcr.io/<PROJECT_ID>/cineconnect-web \
  --platform managed \
  --region <REGION> \
  --allow-unauthenticated
```

### 3) Base de donnees (PostgreSQL)

- Fournir une base PostgreSQL managée (Cloud SQL ou autre).
- Appliquer les migrations:

```bash
pnpm --dir backend db:migrate
```

Vous pouvez executer cette commande localement avec `DATABASE_URL` de production, ou depuis une CI/CD securisee.

### 4) Script one-click (PowerShell)

Un script est disponible pour deployer backend + frontend automatiquement:

```powershell
./scripts/deploy-cloudrun.ps1 -ProjectId <PROJECT_ID> -Region <REGION>
```

Mode recommande avec Secret Manager:

```powershell
./scripts/deploy-cloudrun.ps1 -ProjectId <PROJECT_ID> -Region <REGION> -Environment prod -UseSecretManager
```

Secrets attendus (nom -> variable backend):

- `cineconnect-<env>-database-url` -> `DATABASE_URL`
- `cineconnect-<env>-jwt-secret` -> `JWT_SECRET`
- `cineconnect-<env>-omdb-api-key` -> `OMDB_API_KEY`
- `cineconnect-<env>-mailgun-api-key` -> `MAILGUN_API_KEY`

`<env>` correspond a `dev`, `staging` ou `prod`.

Exemple de creation:

```powershell
echo -n "postgresql://..." | gcloud secrets create cineconnect-prod-database-url --data-file=-
echo -n "super_secret_jwt" | gcloud secrets create cineconnect-prod-jwt-secret --data-file=-
echo -n "your_omdb_key" | gcloud secrets create cineconnect-prod-omdb-api-key --data-file=-
echo -n "key-xxxx" | gcloud secrets create cineconnect-prod-mailgun-api-key --data-file=-
```

Si les secrets existent deja, utilisez `gcloud secrets versions add <secret-name> --data-file=-`.

Rotation: vous pouvez deployer avec une version precise:

```powershell
./scripts/deploy-cloudrun.ps1 -ProjectId <PROJECT_ID> -Region <REGION> -Environment prod -UseSecretManager -SecretVersion 3
```

Le script cree des services Cloud Run suffixes par environnement:

- `prod`: `cineconnect-api` / `cineconnect-web`
- `dev`: `cineconnect-api-dev` / `cineconnect-web-dev`
- `staging`: `cineconnect-api-staging` / `cineconnect-web-staging`

Mode manuel (sans Secret Manager): editez les variables en tete de `scripts/deploy-cloudrun.ps1` (`DATABASE_URL`, `JWT_SECRET`, `OMDB_API_KEY`, `MAILGUN_*`), puis lancez la commande sans `-UseSecretManager`.

Mode verification (sans deploy):

```powershell
./scripts/deploy-cloudrun.ps1 -ProjectId <PROJECT_ID> -Region <REGION> -Environment prod -UseSecretManager -DryRun
```

## Statut de preparation deploiement

Etat actuel verifie:

- Backend typecheck: OK
- Frontend typecheck: OK
- Frontend build production: OK
- Tests + couverture monorepo: OK (100% sur le perimetre configure)
- Swagger/OpenAPI: OK

Points d'attention avant prod:

- Definir un `JWT_SECRET` robuste.
- Configurer `FRONTEND_URL` exact pour CORS.
- Renseigner `VITE_API_URL` et `VITE_SOCKET_URL` sur le frontend deploye.
- Configurer Mailgun (`MAILGUN_*`) pour l'envoi email de reinitialisation.

## Licence

Projet academique Web2 HETIC.
