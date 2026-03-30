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

## Deploiement OVH + Coolify (Docker Compose)

Pour un deploiement sur ton serveur OVH via Coolify, la stack production est dans **`docker-compose.yaml`** (fichier complet, pas seulement un `include` — certains serveurs Coolify ne resolvent pas les `include` correctement). `docker-compose.coolify.yml` reexporte le meme contenu via `include` si tu preferes ce chemin. Le fichier `docker-compose.yml` reste reserve au **local**.

### 0) Si l’app affiche « Exited » et les domaines sont vides

Sans domaines sur **`web`** et **`api`**, Coolify ne cree pas les variables magiques (`SERVICE_URL_*`, secrets auto). Il faut alors aller dans **Environment Variables** et definir au minimum **`JWT_SECRET`** (32+ caracteres) et **`POSTGRES_PASSWORD`**, plus **`FRONTEND_URL`**, **`VITE_API_URL`** et **`VITE_SOCKET_URL`** (URLs publiques prevues pour ton app et ton API) jusqu’a ce que les domaines soient configures. Ensuite **Save** et **Deploy**. Consulte l’onglet **Logs** si ca echoue encore.

### 1) Dans Coolify (application Docker Compose)

- Type de ressource: **Docker Compose** (pas une seule app « Dockerfile »).
- Base Directory: `/`
- Docker Compose Location: **`/docker-compose.yaml`** (recommande). Alternative: `/docker-compose.coolify.yml` (alias vers le meme stack).
- **Domaines Coolify** (voir [doc Coolify — Docker Compose](https://coolify.io/docs/knowledge-base/docker/compose)) : le champ domaine doit finir par **`:8080`** pour indiquer le port **dans le conteneur** (nginx `web` et Node `api` ecoutent tous deux sur **8080**). Sinon Traefik devine souvent le mauvais port → **404** ou **502**.

  - **`web`** : `http://` ou `https://web-xxxxx….sslip.io:8080`
  - **`api`** : `http://` ou `https://api-xxxxx….sslip.io:8080`

  **Ne mets pas** seulement **`:80`** pour `web` (comportement imprevisible selon les versions Coolify). **Dans le navigateur**, ouvre toujours `http(s)://web-….sslip.io` **sans** `:8080` (le proxy ecoute en 80/443).

- Ne publie pas `db` publiquement (pas de domaine, pas de `ports:` sur `db`).

### 2) Automatisation (variables generees par Coolify)

Le compose s’appuie sur les [variables magiques](https://coolify.io/docs/knowledge-base/docker/compose#coolify-s-magic-environment-variables) des que les domaines sont poses sur `web` et `api` :

| Besoin | Remplissage automatique (Coolify) | Surcharge manuelle dans l’UI |
|--------|-----------------------------------|------------------------------|
| URL du frontend (CORS) | `SERVICE_URL_WEB_8080` | `FRONTEND_URL` |
| Build Vite (API / Socket) | `SERVICE_URL_API_8080` | `VITE_API_URL`, `VITE_SOCKET_URL` |
| Mot de passe Postgres | `SERVICE_PASSWORD_POSTGRES` ou `SERVICE_PASSWORD_DB` | `POSTGRES_PASSWORD` |
| Secret JWT | `SERVICE_BASE64_64_API` | `JWT_SECRET` |

En production, l’API refuse de demarrer si `JWT_SECRET` est absent ou egal a `secret` (apres interpolation Coolify).

Au demarrage, **`api`** execute `pnpm db:migrate` puis le serveur (`backend/docker-entrypoint.sh`).

**Optionnel** : `OMDB_API_KEY`, `MAILGUN_*` (voir `.env.coolify.example`).

### 2b) Deploiement continu (Git push → Coolify)

1. Dans Coolify : **Deployments** → copier l’URL du **Deploy Webhook**.
2. Sur GitHub : **Settings → Secrets and variables → Actions** → creer `COOLIFY_WEBHOOK_URL` avec cette URL.
3. A chaque push sur `main` ou `master`, le workflow `.github/workflows/deploy-coolify.yml` declenche un redeploiement.

En local : `./scripts/trigger-coolify-deploy.ps1` (variable d’environnement `COOLIFY_WEBHOOK_URL` ou parametre `-WebhookUrl`).

### 2c) Ca ne marche toujours pas (Coolify)

0. **« 404 page not found » sur l’IP du serveur** (`http://149.x.x.x`) : c’est **normal**. Coolify (Traefik) route selon le **nom de domaine**, pas l’adresse IP seule.

0b. **502 Bad Gateway** : le proxy joint le conteneur mais le **port** ne correspond pas. Verifie dans Coolify que **`web`** et **`api`** ont bien **`:8080`** a la fin du champ domaine (pas **`:80`** seul pour `web`). Redeploie apres `git pull`.

0c. **Faute de frappe dans le sous-domaine** : copie-colle l’URL depuis Coolify. Un caractere en trop (ex. `vsrmb` au lieu de `vsmb`) change le nom d’hôte → souvent **502** ou mauvaise route.

1. **URL dans le navigateur** : ouvre l’URL du service **`web`** **sans** `:8080` (ex. `http://web-….sslip.io`). Verifie l’orthographe **caractere par caractere** avec la ligne **Domains for web** dans Coolify.
2. **Logs Coolify** : onglet **Logs** pour `api`, puis `web`, puis `db` — erreurs `JWT_SECRET`, Postgres, ou migrations en premier.
3. **Depuis le VPS** (SSH) : `curl -sI http://127.0.0.1` ou teste que le proxy repond ; si l’API ecoute, les logs doivent afficher `API listening on http://0.0.0.0:8080` apres redeploiement.
4. **CORS** : ouvre les outils developpeur (F12) → onglet **Network** / **Console**. Si tu vois des erreurs du type *blocked by CORS*, verifie que **`FRONTEND_URL`** dans Coolify est exactement l’URL que tu utilises dans la barre d’adresse (meme `http` vs `https`, pas de slash final). Tu peux ajouter **`CORS_EXTRA_ORIGINS`** (origines separees par des virgules) sur le service **`api`** dans le compose / variables Coolify pour autoriser plusieurs URLs.
5. **Pare-feu** : le serveur doit laisser passer **80** et **443** (et le port du dashboard Coolify si besoin).

### 3) DNS OVH

Creer 2 enregistrements DNS vers ton serveur OVH (ou vers le reverse proxy Coolify):

- `app.ton-domaine.com`
- `api.ton-domaine.com`

Puis redeployer dans Coolify.

### 4) Erreur "Exited" en mode Dockerfile (une seule app)

Si tu as choisi **Build Pack: Dockerfile** (au lieu de **Docker Compose**), verifie ces points — ce sont les causes les plus frequentes de conteneur qui quitte tout de suite ou qui ne repond pas :

1. **Port du conteneur**  
   L’API ecoute sur **8080**. Sur **Coolify**, le service **`web`** utilise la cible Docker **`coolify`** (**nginx** sur **8080** dans le conteneur). Dans l’UI Coolify, mets **`:8080`** sur les domaines **web** et **api**.

2. **Il n’y a pas de `Dockerfile` a la racine du depot**  
   Les fichiers sont dans `backend/Dockerfile` et `frontend/Dockerfile`.  
   - Soit tu configures **Base Directory** = `backend` (ou `frontend`) **et** le chemin du Dockerfile correspondant,  
   - soit tu deployes **deux** ressources (une API, une Web),  
   - soit tu passes en **Docker Compose** avec `docker-compose.yaml` (recommande pour tout le stack).

3. **Backend sans base**  
   Si tu ne deployes que l’API, il faut `DATABASE_URL` (et les autres variables) dans **Environment Variables**. Sans `DATABASE_URL`, le processus quitte au demarrage (`process.exit(1)`).

4. **Logs**  
   Onglet **Logs** de l’application dans Coolify : la premiere ligne d’erreur indique presque toujours la cause (port, env manquant, build).

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

- Coolify : domaines `web` / `api` avec **:8080** pour que les `SERVICE_URL_*_8080` soient corrects.
- Si une variable magique JWT / Postgres n’apparait pas, surcharger `JWT_SECRET` / `POSTGRES_PASSWORD` dans l’UI Coolify.
- Configurer Mailgun (`MAILGUN_*`) pour l’envoi e-mail de reinitialisation (sinon mode logs uniquement).

## Licence

Projet academique Web2 HETIC.
