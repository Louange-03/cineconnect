# CineConnect

Plateforme web full stack pour découvrir des films, les noter, gérer des amis et discuter en temps réel.

## Lancement Local (Exact)

Cette section est la référence unique.  
Si tu suis exactement ces commandes, le projet démarre complet en local.

### 1) Prérequis

- Node.js 20+
- pnpm 10+
- Docker Desktop démarré

Vérifier:

```bash
node -v
pnpm -v
docker --version
```

### 2) Clone + install

```bash
git clone https://github.com/Louange-03/cineconnect.git
cd cineconnect
pnpm install
```

### 3) Fichiers `.env` exacts

`backend/.env` (minimum local):

```env
PORT=3001
DATABASE_URL=postgresql://cineconnect:cineconnect@localhost:5437/cineconnect
JWT_SECRET=change_this_secret_min_32_chars
FRONTEND_URL=http://localhost:5173
OMDB_API_KEY=
TMDB_API_KEY=
MAIL_PROVIDER=log
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
VITE_ENABLE_DEVTOOLS=false
```

### 4) Démarrer DB + Adminer (commande exacte)

Important: ce repo contient `docker-compose.yml` (local) et `docker-compose.yaml` (prod/Coolify).  
En local, utilise toujours `-f docker-compose.yml`.

```bash
docker context use default
docker compose -f docker-compose.yml up -d db adminer
docker compose -f docker-compose.yml ps
```

Tu dois voir `cineconnect-db` et `cineconnect-adminer` en `Up`.

### 5) Migrations DB (obligatoire)

```bash
pnpm --dir backend db:migrate
```

### 6) Démarrer l’application

```bash
pnpm dev
```

### 7) URLs à ouvrir

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api/docs`
- Adminer: `http://localhost:8083`

Connexion Adminer:

- System: `PostgreSQL`
- Server: `db` (ou `localhost`)
- Username: `cineconnect`
- Password: `cineconnect`
- Database: `cineconnect`

## Commandes Utiles (Exactes)

### Arrêter / redémarrer Docker local

```bash
docker compose -f docker-compose.yml stop db adminer
docker compose -f docker-compose.yml up -d db adminer
docker compose -f docker-compose.yml down
```

### Scripts PowerShell (optionnel)

```powershell
./scripts/docker-local-up.ps1
./scripts/docker-local-down.ps1
./scripts/docker-local-down.ps1 -All
```

### Tests et qualité

Vérification complète (recommandé avant commit ou déploiement) :

```bash
pnpm verify
```

Équivalent détaillé (ou exécution ciblée) :

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm --dir frontend build
```

Sous Windows : `.\scripts\verify.ps1`

Documentation : [Structure du dépôt et de l’IDE](docs/STRUCTURE-DU-DEPOT.md).

## Seed Catalogue (Optionnel)

Importer plus de films:

```bash
pnpm --dir backend seed:tmdb
```

## Dépannage Rapide

- `open //./pipe/dockerDesktopLinuxEngine...`: Docker Desktop non prêt ou mauvais contexte.
  - Exécuter:
    ```bash
    docker context use default
    docker version
    ```
- Adminer inaccessible:
  - Vérifier:
    ```bash
    docker compose -f docker-compose.yml ps
    ```
  - Puis ouvrir `http://localhost:8083` (pas `8003`).
- Erreur CORS en local:
  - Vérifier `frontend/.env` et `backend/.env` (URLs localhost ci-dessus).
- Après `git pull`:
  - relancer:
    ```bash
    pnpm install
    pnpm --dir backend db:migrate
    ```

## Notes Déploiement

- Local/dev: `docker-compose.yml`
- Coolify/prod: `docker-compose.yaml`

## Vérification Finale (Checklist)

Après démarrage, valider rapidement ces points:

- `http://localhost:5173` charge la page d'accueil
- `http://localhost:3001/health` retourne `{"ok":true}`
- `http://localhost:3001/api/docs` affiche Swagger
- `http://localhost:8083` ouvre Adminer
- la page `Films` affiche un catalogue
- la page `Utilisateurs` liste d'autres comptes (si présents)

## Commandes de Diagnostic Rapide

Si quelque chose ne marche pas, exécuter:

```bash
docker context ls
docker compose -f docker-compose.yml ps
docker compose -f docker-compose.yml logs --tail=100 db
docker compose -f docker-compose.yml logs --tail=100 adminer
pnpm --dir backend typecheck
pnpm --dir frontend typecheck
```

## Réinitialisation Propre (Local)

Si l'environnement local est cassé et tu veux repartir propre:

```bash
docker compose -f docker-compose.yml down
pnpm install
docker context use default
docker compose -f docker-compose.yml up -d db adminer
pnpm --dir backend db:migrate
pnpm dev
```

## Première Utilisation (Social + Discussion)

Pour tester les fonctionnalités amis/discussion:

1. Créer un premier compte.
2. Se déconnecter puis créer un second compte.
3. Revenir sur le premier compte.
4. Aller dans `Utilisateurs` et envoyer une demande d'ami.
5. Accepter depuis le second compte dans `Amis`.
6. Ouvrir `Discussion` et envoyer des messages.

## Ports Utilisés en Local

- `5173`: frontend Vite
- `3001`: backend API
- `5437`: PostgreSQL
- `8083`: Adminer

Si un port est déjà pris, arrêter le process bloquant puis relancer les commandes.
