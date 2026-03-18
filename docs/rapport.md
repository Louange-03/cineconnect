## Rapport — CinéConnect

### 1) Présentation

CinéConnect est une application web full stack qui permet de **découvrir des films**, **noter des œuvres**, et **échanger en temps réel** avec d’autres utilisateurs via une messagerie.

### 2) Architecture

- **Monorepo pnpm** : `frontend/`, `backend/`, `shared/`, `docs/`
- **Frontend** : React + TanStack Router + TanStack Query + TailwindCSS
- **Backend** : Node.js + Express + Drizzle ORM + JWT + Socket.io
- **DB** : PostgreSQL
- **API externe** : OMDb (recherche & import)

### 3) Données & persistance

Les films sont stockés en base dans `films` (id interne UUID + `imdb_id` unique). Les genres/catégories sont normalisés via `categories` et la table de jointure `film_categories`.

### 4) Sécurité

L’authentification est gérée via **JWT**. Les routes sensibles exigent `Authorization: Bearer <token>`.

### 5) Documentation & tests

- **Swagger UI** disponible sur `GET /api/docs`
- Tests backend via **Vitest** + **Supertest** (auth, films, swagger, proxy OMDb)

### 6) Organisation Git (workflow)

Développement par **branches de feature** (ex: `feature/gestion-des-films`), avec commits réguliers. Chaque fonctionnalité stabilisée est poussée sur GitHub.

