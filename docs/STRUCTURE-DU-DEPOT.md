# Structure du dépôt et de l’IDE

Ce document explique comment le monorepo CineConnect est organisé, pourquoi on ne doit voir **qu’un seul dossier `backend`**, et comment éviter les confusions (clone imbriqué, « CineConnect » en double dans l’explorateur).

## Monorepo (une seule racine Git)

- La racine du dépôt contient **`pnpm-workspace.yaml`** avec les paquets : racine `.`, **`backend`**, **`frontend`**.
- **`pnpm install`** s’exécute **à la racine** ; il installe les dépendances de tous les workspaces.
- Il n’y a **pas** de second workspace dans `frontend/` (l’ancien `frontend/pnpm-workspace.yaml` a été retiré pour éviter que l’IDE ou pnpm traite `backend` comme un projet séparé en double).

## Fichiers Docker Compose

| Fichier | Usage |
|--------|--------|
| `docker-compose.yml` | **Local** : PostgreSQL, Adminer, etc. Toujours `-f docker-compose.yml` en dev. |
| `docker-compose.yaml` | **Coolify / prod** : stack complète (API, web, DB…). |
| `docker-compose.coolify.yml` | Point d’entrée Coolify qui inclut la stack adaptée. |

## Dossier `cineconnect/` à l’intérieur du repo

Si tu vois un dossier **`cineconnect/cineconnect/`** (clone du même repo à l’intérieur de lui-même) :

- Ce n’est **pas** la structure normale du projet.
- Il est listé dans **`.gitignore`** (`/cineconnect/`) pour éviter de le versionner par erreur.
- Supprime ce dossier imbriqué manuellement (ferme les terminaux/IDE qui l’utilisent si Windows refuse la suppression).

## « Deux fois CineConnect » dans Cursor / VS Code

Souvent c’est :

1. **Un workspace multi-dossiers** qui ouvre à la fois la racine et un sous-dossier, ou
2. **Un clone imbriqué** (voir ci-dessus).

Vérifie que tu ouvres **un seul dossier** : la racine du clone (`…/cineconnect`), pas `…/cineconnect/cineconnect`.

## Vérifier que tout est sain

À la racine du dépôt :

```bash
pnpm verify
```

Cela enchaîne : **typecheck** (backend + frontend), **lint** (backend + frontend), **tests** (backend + frontend).

Sous Windows PowerShell, tu peux aussi lancer :

```powershell
./scripts/verify.ps1
```

## Commandes utiles par paquet

| Objectif | Commande |
|----------|----------|
| Typecheck global | `pnpm typecheck` |
| Lint global | `pnpm lint` |
| Tests global | `pnpm test` |
| Build frontend prod | `pnpm --dir frontend build` |
| Valider un fichier compose (avec variables d’env minimales) | `docker compose -f docker-compose.yml config` |

Les avertissements Docker sur des variables non définies sont normaux en local si tu ne passes pas toutes les variables Coolify ; l’important est que la commande se termine sans erreur de syntaxe.
