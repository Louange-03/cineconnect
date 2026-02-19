# CineConnect

Une plateforme collaborative pour découvrir, filtrer, noter et discuter de films avec des amis.

## Structure du projet

```
Cineconnect/
├── backend/               # Express + Drizzle ORM + Socket.io
├── frontend/              # React + Vite + TanStack Router/Query
├── docker-compose.yml     # Configuration de PostgreSQL
├── pnpm-workspace.yaml    # Configuration du monorepo pnpm
└── README.md              # Ce fichier
```

> Le dépôt est organisé en workspace pnpm avec des packages frontend et backend séparés.

## Stack technologique

- **Frontend** : React 18, TypeScript, Vite, TanStack Router, TanStack Query, Tailwind CSS
- **Backend** : Node.js, Express, TypeScript, Drizzle ORM, authentification JWT, Socket.io
- **Base de données** : PostgreSQL (exécuté en Docker via docker-compose)
- **Tests** : Vitest pour les tests unitaires/intégration, Playwright pour les tests end‑to‑end

## Aperçu de l'architecture

### Backend (Architecture propre / Clean Architecture)

- `backend/src/domain/` – entités métier et interfaces de dépôt
- `backend/src/application/` – cas d'utilisation implémentant les règles métier
- `backend/src/infrastructure/` – implémentations Drizzle ORM et container DI
- `backend/src/routes/` – gestionnaires Express appelant les cas d'utilisation

Principes clés :

1. La logique métier réside dans les cas d'utilisation, pas dans les routes.
2. Les routes ne gèrent que les aspects HTTP.
3. L'injection de dépendances via `tsyringe` découple les couches.
4. Les entités sont des classes TypeScript agnostiques au framework.

### Frontend

- `frontend/src/components/` – composants UI classés par fonctionnalité et primitives génériques
- `frontend/src/hooks/` – hooks personnalisés encapsulant TanStack Query
- `frontend/src/lib/` – clients API, utilitaires, gestion des tokens
- `frontend/src/pages/` – composants de pages utilisés par TanStack Router
- `frontend/src/router.tsx` – configuration du routage avec routes protégées
- `frontend/src/types/` – types TypeScript partagés

Schémas :

- Hooks personnalisés pour l'interaction avec l'API
- Contextes pour l'authentification et la connexion socket
- Composants par fonctionnalité séparés de l'UI générique

## Démarrage

### Prérequis

- Node.js ≥ 20.0.0
- pnpm ≥ 9.0.0
- Docker (pour PostgreSQL)

### Installation

```bash
# cloner le dépôt
git clone https://github.com/YOUR_USERNAME/Cineconnect.git
cd Cineconnect

# installer les dépendances du workspace
pnpm install
```

### Variables d'environnement

Copiez les exemples de fichiers env et ajustez-les :

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Remplissez `backend/.env` :

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cineconnect
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars-long
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5173
```

Remplissez `frontend/.env` :

```
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_API_URL=http://localhost:3000
```

Obtenez une clé API TMDb gratuite sur https://www.themoviedb.org/settings/api.

### Base de données

Exécutez les migrations avec l'outil Drizzle :

```bash
pnpm db:generate
pnpm db:migrate
```

### Serveurs de développement

Lancez simultanément le frontend et le backend :

```bash
pnpm dev
```

- Frontend : http://localhost:5173
- Backend : http://localhost:3000
- Documentation de l'API (Swagger) : http://localhost:3000/api-docs

Pour démarrer un seul service :

- `pnpm dev:frontend`
- `pnpm dev:backend`

## Scripts

| Commande            | Description                                  |
|--------------------|----------------------------------------------|
| `pnpm dev`         | Lance frontend & backend en mode dev         |
| `pnpm dev:frontend`| Frontend uniquement                          |
| `pnpm dev:backend` | Backend uniquement                           |
| `pnpm build`       | Compile tous les packages                    |
| `pnpm test`        | Execute tous les tests (unitaires+intégration) |
| `pnpm test:frontend` | Tests frontend                             |
| `pnpm test:backend` | Tests backend                               |
| `pnpm test:e2e`    | Tests end‑to‑end Playwright                  |
| `pnpm lint`        | Vérification ESLint                          |
| `pnpm db:generate` | Génère des migrations Drizzle                |
| `pnpm db:migrate`  | Applique les migrations                      |
| `pnpm db:studio`   | Ouvre Drizzle Studio                         |

## Schéma de la base de données (vue d'ensemble)

- `users` : id, email, nom d'utilisateur, password_hash, avatar_url, timestamps
- `films` : id, tmdb_id, titre, année, affiche, synopsis, métadonnées, timestamps
- `reviews` : id, user_id, film_id, note, commentaire, timestamps
- `messages` : id, sender_id, receiver_id, contenu, lu, created_at
- `friends` : id, sender_id, receiver_id, statut, timestamps

## Endpoints de l'API (v1)

**Authentification**
- `POST /auth/register` – enregistrer un nouvel utilisateur
- `POST /auth/login` – se connecter
- `POST /auth/refresh` – renouveler les tokens

**Utilisateurs**
- `GET /users/me` – utilisateur courant
- `GET /users/:id` – utilisateur par ID
- `PATCH /users/me` – mettre à jour le profil

**Films**
- `GET /films` – lister les films
- `GET /films/:id` – détails d’un film
- `GET /films/tmdb/:tmdbId` – récupérer depuis TMDb
- `POST /films/tmdb` – enregistrer un film via TMDb

**Avis (Reviews)**
- `POST /reviews` – créer
- `GET /reviews/:id` – avis unique
- `GET /reviews/film/:filmId` – avis d’un film
- `GET /reviews/user/:userId` – avis d’un utilisateur
- `PATCH /reviews/:id` – modifier
- `DELETE /reviews/:id` – supprimer
- Endpoints de réaction pour likes/commentaires

**Messages & Amis**
- divers endpoints pour conversations, envoi de messages, demandes d’amitié

## Événements WebSocket

- `connect`, `disconnect`, `message`, `typing`, `online`, `join_room`, `leave_room`

## Sécurité & Bonnes pratiques

- Authentification JWT avec tokens d’accès/rafraîchissement.
- Token d’accès en localStorage, rafraîchissement via cookie sécurisé.
- Toutes les connexions socket exigent un JWT valide.
- Limitation de débit sur la messagerie et les routes sensibles.
- Sanitation des entrées pour éviter les XSS.
- CORS limité à l’origine du frontend.

## Tests

- Tests unitaires & d’intégration sous `src/__tests__/`.
- Tests E2E Playwright simulant des parcours utilisateurs.
- Couverture maintenue à 100 % dans le CI.

## Contribution

Voir `docs/CONTRIBUTING.md` pour l’intégration et les consignes.

---

Ce README reflète la structure et les technologies actuelles du projet CineConnect. N’hésitez pas à l’adapter ou l’enrichir au fil de l’évolution du projet.