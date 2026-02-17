# Auth API (backend)

## Variables d'environnement

Voir `backend/.env.example`.

Obligatoires:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

## Endpoints

### `POST /auth/register`

Body:

```json
{ "email": "a@b.com", "username": "alice", "password": "secret123" }
```

Réponse:

- `token` = access token (JWT)
- `user`
- **Set-Cookie**: `refreshToken` (HttpOnly) sur le path `/auth/refresh`

### `POST /auth/login`

Body:

```json
{ "email": "a@b.com", "password": "secret123" }
```

Réponse:

- `token` = access token
- `user`
- **Set-Cookie**: `refreshToken` (HttpOnly)

### `POST /auth/refresh`

- Lit le cookie HttpOnly `refreshToken`
- Renvoie un nouveau `token` (access token) + `user`
- Renvoie aussi un nouveau cookie `refreshToken`

### `POST /auth/logout`

Headers:

- `Authorization: Bearer <accessToken>`

Effets:

- Incrémente `tokenVersion` en DB (invalide les refresh tokens existants)
- Supprime le cookie `refreshToken`

### `GET /auth/me`

Headers:

- `Authorization: Bearer <accessToken>`

Réponse:

- `user` (payload du token)

## Notes sécurité

- Access token court (`JWT_ACCESS_EXPIRES_IN`, défaut `15m`)
- Refresh token en cookie HttpOnly
- `tokenVersion` permet d'invalider tous les refresh tokens lors d'un logout
- CORS avec `credentials: true` (nécessaire pour envoyer/recevoir le cookie)

## Test rapide (curl)

> Remplace `http://localhost:3001` si besoin.

Register:

```bash
curl -i -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.com","username":"alice","password":"secret123"}'
```

Login:

```bash
curl -i -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.com","password":"secret123"}'
```

Refresh (en réutilisant le cookie reçu):

```bash
curl -i -X POST http://localhost:3001/auth/refresh \
  --cookie "refreshToken=<COLLE_ICI>"
```
