# Gestion des films – CinéConnect

## Fonctionnalités principales

- **Liste des films** (base locale) : recherche, filtre par catégorie/année, pagination
- **Détail d’un film** (base locale) : affiche synopsis, affiche, catégories associées
- **Recherche externe** (OMDb) : proxy côté backend pour éviter d’exposer la clé API
- **Catégories** : endpoint dédié pour la liste, association film/catégorie
- **Seed** : script pour remplir la base avec 50+ films et catégories

---

## Backend

### Schéma SQL (Drizzle)

- `films` (id, title, year, poster_url, synopsis, metadata, ...)
- `categories` (id, name)
- `film_categories` (film_id, category_id)

### Endpoints REST

- `GET /films` – liste des films, filtres possibles : `q` (titre), `category`, `year`, `limit`
- `GET /films/search?q=...` – alias de la liste pour recherche rapide
- `GET /films/categories` – récupérer la liste des catégories
- `GET /films/:id` – détails d’un film (inclut catégories)
- `GET /films/omdb/search?q=...` – recherche dans l’API OMDb (pour import)
- `POST /films/import` – importer un film par `imdbID` (corps JSON : `{ "imdbID": "tt0133093" }`)

### Seed

- **OMDb (recommandé)** : `npx tsx backend/scripts/seed_omdb_massive.ts` — import massif depuis l’API OMDb (nécessite `OMDB_API_KEY` dans `backend/.env`).
- Liste ciblée : `npx tsx backend/scripts/seed_omdb.ts` — quelques dizaines de titres prédéfinis.

---

## Frontend

### Pages

- `/films` – liste complète avec recherche (hook `useFilms`)
- `/film/:id` – détail d’un film (hook `useQuery`)

### Composants à prévoir

- `FilmCard` – carte film (affiche, titre, année, note)
- `FilmGrid` – grille responsive de films
- `SearchBar` – recherche avec debounce
- `FilterPanel` – filtres (catégorie, année)

### Types partagés

- `Film`, `Category` dans `frontend/src/types/index.ts`
- `OMDBMovie`, `OMDBMovieDetail` pour la recherche externe

---

## Exemple d’utilisation API (local)

```http
GET /films?q=inception&category=Science-fiction
```

Réponse :
```json
{
  "films": [
    {
      "id": "...",
      "title": "Inception",
      "year": "2010",
      "posterUrl": "...",
      "synopsis": "...",
      "categories": ["Science-fiction"]
    }
  ]
}
```

---

## Checklist pour la branche `gestion-des-films`

- [x] Schéma SQL et seed OK
- [x] Contrôleur et routes REST `/films` propres
- [x] Types partagés côté front
- [ ] Composants UI (FilmCard, FilmGrid, SearchBar, FilterPanel)
- [ ] Pages `/films` et `/film/:id` connectées à la base locale
- [ ] Tests manuels Postman + front

**À chaque étape, faire un commit/push sur la branche `gestion-des-films`.**
