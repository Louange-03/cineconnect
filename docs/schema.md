## Schéma (simplifié)

### Tables principales

- `users`
- `films`
- `categories`
- `film_categories` (many-to-many)
- `reviews`
- `friendships` (relations utilisateurs)
- `conversations`, `conversation_members`, `messages` (messagerie temps réel)

### Relations

- **users ↔ reviews** : un utilisateur écrit plusieurs avis (`reviews.user_id → users.id`)
- **films ↔ reviews** : un film a plusieurs avis (`reviews.film_id → films.id`)
- **films ↔ categories** : relation N‑N via `film_categories`
- **users ↔ friendships** : relation N‑N via `friendships` (requester/addressee + status)
- **conversations ↔ users** : relation N‑N via `conversation_members`
- **conversations ↔ messages** : une conversation contient plusieurs messages

### Clés/contraintes importantes

- `users.email` unique
- `users.username` unique
- `films.imdb_id` unique
- `reviews`: unique `(user_id, film_id)` (un avis par film/utilisateur)
- `film_categories`: unique `(film_id, category_id)`

