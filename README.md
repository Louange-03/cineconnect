  # Cineconnect (monorepo)

## Prérequis

- Node.js + pnpm
- Une base Postgres (voir `backend/.env.example`)

## Installation

À la racine :

```bash
pnpm install
```

## Démarrer le projet (front + back)

À la racine :

```bash
pnpm dev
```

- Front: http://localhost:5173
- Back: http://localhost:3001

## Variables d'environnement

- Backend: copier `backend/.env.example` vers `backend/.env` et remplir les valeurs.

## Migration DB

Dans `backend/` :

```bash
pnpm db:migrate
```
