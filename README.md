# CinéConnect

CinéConnect est une plateforme communautaire moderne dédiée aux passionnés de cinéma. Elle permet de découvrir des films, de gérer un catalogue interactif (connecté à OMDb), de partager ses avis, et d'échanger avec d'autres cinéphiles via une interface de messagerie intégrée. Le tout dans une esthétique professionnelle "Premium Dark Theme", fluide et hautement réactive.

##  Fonctionnalités Principales

- **Catalogue de Films Intelligent** : Parcourez, filtrez et cherchez directement dans les films de la base de données.
- **Importation depuis OMDb** : Si le catalogue est vide ou si un film manque, recherchez-le directement depuis l'application via l'API OMDb et ajoutez-le à la volée.
- **Authentification Sécurisée** : Inscription et connexion gérées avec JWT (JSON Web Tokens), et hachage sécurisé des mots de passe.
- **Système d'Avis et Notes** : Notez les œuvres et lisez les longues critiques détaillées de la communauté sur de magnifiques fiches de films.
- **Messagerie Intégrée (Discussions)** : Interface de chat façon *Discord/Messages* pour retrouver vos boîtes de réception et échanger en temps réel avec tous vos amis.
- **Design Premium** : Interface utilisateur UI/UX refaite à neuf (Tailwind CSS v4) incluant des effets de Glassmorphism (flou), des animations immersives, des lueurs (glows) abstraites en arrière-plan et un support full responsive.

## 🛠️ Stack Technologique

**Frontend (Web & Interface)**
- **React 18** (TypeScript)
- **Vite** (Build Tool ultra rapide et Proxy)
- **TanStack Router** (Système de routage basé sur les fichiers, type-safe)
- **TanStack Query** (Gestion fine du cache, des mutations et états asynchrones)
- **Tailwind CSS v4** (Design system utilitaire et flexible)

**Backend (API & Data)**
- **Node.js** & **Express**
- **TypeScript**
- **Drizzle ORM** (Liaisons SQL rapides et type-safe)
- **PostgreSQL** (Structure de base de données relationnelle robuste)
- **Zod** (Validation fine des requêtes entrantes)

##  Structure du Projet (Monorepo)

Le dépôt est organisé en mode *Workspace* `pnpm` :

```text
cineconnect/
├── backend/               # Serveur API
│   ├── src/controllers/   # Logique métier pour Auth, Films, Messages, etc.
│   ├── src/db/            # Connecteur PostgreSQL et schémas Drizzle (schema.ts)
│   ├── src/middlewares/   # Protections et sécurisation (ex: validation JWT)
│   ├── src/routes/        # Déclaration de tous les Endpoints REST
│   └── src/server.ts      # Le cœur de l'application Express
│
├── frontend/              # Interface client
│   ├── src/components/    # Composants d'UI isolés (films, auth, layout, ui)
│   ├── src/hooks/         # Logique API connectée avec les contextes
│   ├── src/lib/           # Utilitaires globaux (apiClient, auth manager)
│   ├── src/pages/         # Mappage avec le routeur (Films, Accueil, Connexion...)
│   ├── src/routeTree.gen.ts # Routage automatique (Tanstack Router)
│   └── src/index.css      # Règles CSS globales et Keyframes d'animations
│
├── docker-compose.yml     # Conteneur pour s'initialiser facilement avec PostgreSQL
└── package.json           # Racine du workspace
```

##  Prérequis et Installation

Pour exécuter et contribuer à ce projet localement, il vous faut :
- **Node.js** (v20.x ou >)
- **pnpm** (comme gestionnaire de paquets)
- **PostgreSQL** (installé en dur, ou lancé via Docker)

### 1. Clonage et Installation
```bash
git clone https://github.com/Louange-03/cineconnect.git
cd cineconnect
pnpm install
```

### 2. Configuration des .env
Copiez (ou créez) les fichiers d'environnement.

Dans le dossier **`backend/`**, créez ou éditez `.env` :
```env
PORT=3007
DATABASE_URL=postgresql://user:motdepasse@localhost:5432/cineconnect
JWT_SECRET=super_secret_phrase_au_moins_32_caracteres_min
FRONTEND_URL=http://localhost:5173
OMDB_API_KEY=votre_cle_omdb
```

Dans le dossier **`frontend/`**, créez ou éditez `.env` :
```env
VITE_API_URL=http://localhost:3007
VITE_OMDB_API_KEY=votre_cle_omdb # Optionnel (si fetché directement via le back)
```
*(Une clé d'API OMDb gratuite est obtenable sur [omdbapi.com](http://www.omdbapi.com/apikey.aspx))*


### 3. Base de données
Assurez-vous d'avoir une instance Postgres lancée :
```bash
# Optionnel : lancer le docker natif si vous ne l'avez pas
docker compose up -d postgres
```
Poursuivez avec la structuration et la migration (`Drizzle`) :
```bash
pnpm --dir backend db:migrate
```

### 4. Démarrer l'application (Dev)
Grâce au package root, vous pouvez lancer les deux serveurs en parallèle :
```bash
pnpm dev
```
- Le **Frontend** tournera sur : `http://localhost:5173`
- Le **Backend** tournera silencieusement sur : `http://localhost:3007`

*(Vite gère le proxy `/api` via `vite.config.ts`, empêchant la grande majorité des soucis CORS au développement).*

## 📡 Rendu sur l'API

L'application expose une collection de routes REST solides, par exemple :
- **Authentification** : `/api/auth/register`, `/api/auth/login`
- **Contenu Modéré** : `/api/films`, `/api/films/:id`
- **Recherches et Importation Externe** : `/api/films/tmdb?q=...`, `/api/films/import`
- **Contributions (Réseau social)** : `/api/reviews`, `/api/messages`, `/api/users`

Tous les appels sécurisés attendent un `Authorization: Bearer <votre_token_jwt>` obtenu suivant la connexion. Le tout est injecté automatiquement la fonction `apiClient()` construite dans le Front.

---

Projet réalisé dans le cadre académique de développement de la structure "WebApplication complète", **HETIC Web2**.
