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

## Deploiement (guide pratique)

### Option Render (recommandee pour ce depot)

Le fichier `render.yaml` definit un **Blueprint** : Postgres + API Node + site statique (Vite).

- Sur Render : **New** → **Blueprint** → connectez le depot GitHub.
- A la premiere creation, renseignez les variables marquees `sync: false` (secrets) dans le dashboard Render.
- Appliquez les migrations sur la base fournie par Render : `pnpm --dir backend db:migrate` (en local avec `DATABASE_URL` pointant vers la base Render, ou via un job Render).

### 1) Backend

- Deployer `backend` sur une plateforme Node (Render/Railway/Fly/VM).
- Configurer les variables backend (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `OMDB_API_KEY`, etc.).
- Configurer Mailgun: `MAIL_PROVIDER=mailgun` + `MAILGUN_*`.
- Exposer le port via la variable `PORT`.
- Verifier:
  - `GET /health`
  - `GET /api/docs-json`

### 2) Frontend

- Builder et deployer `frontend` (Vercel/Netlify/Cloudflare Pages).
- Configurer:
  - `VITE_API_URL=https://<votre-backend>`
  - `VITE_SOCKET_URL=https://<votre-backend>`

### 3) Base de donnees

- Fournir une base PostgreSQL managée ou auto-hebergee.
- Appliquer `pnpm --dir backend db:migrate` sur l'environnement cible.

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
