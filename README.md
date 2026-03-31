# CineConnect

Plateforme web full stack pour découvrir des films, les noter, gérer des amis et discuter en temps réel.

## TL;DR (pour le jury)

Après un `git clone`, les commandes minimales pour lancer le projet en local sont :

```bash
pnpm install
docker compose up -d db
pnpm --dir backend db:migrate
pnpm dev
```

Puis ouvrir :
- Frontend : `http://localhost:5173`
- API : `http://localhost:3001`
- Swagger : `http://localhost:3001/api/docs`

---

## Fonctionnalités

- Authentification JWT (inscription, connexion, session).
- Catalogue films (listing, détails, recherche, catégories).
- Avis/notes (CRUD).
- Social (amis).
- Messagerie temps réel (Socket.io), réactions, réponses à message.
- Documentation API (Swagger/OpenAPI).

## Stack

- Frontend : React, TypeScript, Vite, TanStack Router, TanStack Query, Tailwind CSS.
- Backend : Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL, Socket.io.
- Outils : pnpm workspace, Vitest, Supertest, Docker Compose.

## Structure du monorepo

```text
/
├─ frontend/    # App React
├─ backend/     # API Express + DB + Socket + Swagger
├─ shared/      # Types/artefacts partagés
├─ docs/        # Docs/rapport
└─ scripts/     # Scripts utilitaires
```

## Prérequis

- Node.js 20+
- pnpm 10+ (compatible avec lockfile courant)
- Docker Desktop (recommandé pour PostgreSQL local)

Vérification rapide :

```bash
node -v
pnpm -v
docker --version
```

## Installation

```bash
git clone https://github.com/Louange-03/cineconnect.git
cd cineconnect
pnpm install
```

## Configuration `.env`

### 1) Backend

Copier `backend/.env.example` vers `backend/.env` puis adapter les valeurs.

Exemple minimal pour local :

```env
PORT=3001
DATABASE_URL=postgresql://cineconnect:cineconnect@localhost:5437/cineconnect
JWT_SECRET=change_this_secret_min_32_chars
FRONTEND_URL=http://localhost:5173

OMDB_API_KEY=
TMDB_API_KEY=
MAIL_PROVIDER=log
```

### 2) Frontend

Créer `frontend/.env` avec :

```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

## Lancer le projet en local (méthode recommandée)

### Étape 1 : démarrer PostgreSQL

```bash
docker compose up -d db
```

Optionnel : Adminer est disponible sur `http://localhost:8083`.

### Étape 2 : exécuter les migrations

```bash
pnpm --dir backend db:migrate
```

> Important : cette étape est obligatoire après clone pour que le schéma soit à jour.

### Étape 3 : démarrer frontend + backend

```bash
pnpm dev
```

Accès :
- Frontend : `http://localhost:5173`
- API : `http://localhost:3001`
- Swagger UI : `http://localhost:3001/api/docs`
- OpenAPI JSON : `http://localhost:3001/api/docs-json`

## Lancer avec Docker Compose complet (option)

```bash
docker compose up --build
```

Services exposés :
- Web : `http://localhost:5173`
- API : `http://localhost:3001`
- DB : `localhost:5437`
- Adminer : `http://localhost:8083`

## Seed (facultatif)

Pour injecter un catalogue de démonstration :

```bash
docker compose --profile seed up seed
```

## Commandes utiles

Depuis la racine :

- `pnpm dev` : lance backend + frontend.
- `pnpm test` : tests backend puis frontend.
- `pnpm test:coverage` : couverture backend + frontend.

Checks par package :

- `pnpm --dir backend typecheck`
- `pnpm --dir backend test`
- `pnpm --dir frontend typecheck`
- `pnpm --dir frontend test`
- `pnpm --dir frontend build`

## Déploiement (résumé)

### Coolify / OVH

- Fichier principal : `docker-compose.yaml`
- En Coolify, configurer les domaines `web` et `api` avec `:8080` côté service.
- Variables minimales recommandées : `JWT_SECRET`, `POSTGRES_PASSWORD`, `FRONTEND_URL`, `VITE_API_URL`, `VITE_SOCKET_URL`.

### Cloud Run

Le repo contient :
- `cloudbuild.backend.yaml`
- `cloudbuild.frontend.yaml`
- `scripts/deploy-cloudrun.ps1`

## Dépannage rapide

- **Erreur DB au démarrage** : vérifier `DATABASE_URL`, puis relancer `pnpm --dir backend db:migrate`.
- **Erreur CORS** : vérifier `FRONTEND_URL` (backend) + URL utilisée dans le navigateur.
- **Frontend ne joint pas l’API** : vérifier `VITE_API_URL` et `VITE_SOCKET_URL` dans `frontend/.env`.
- **Port déjà utilisé** : arrêter le process concerné ou changer le port dans `.env`.
- **Après pull de nouvelles features** : refaire `pnpm install` puis `pnpm --dir backend db:migrate`.

## Sécurité

- Ne jamais commiter de secrets réels dans `backend/.env`.
- Utiliser des clés API de test en local.

## Licence

Projet académique Web2 HETIC.
