// Script d'import massif de films et catégories depuis TMDB
// Lance : npx ts-node backend/drizzle/seedFilms.ts

import fetch from "node-fetch"
import { db } from "../src/db/client"
import { films, categories, filmCategories } from "../src/db/schema"
import { eq } from "drizzle-orm"

const TMDB_API_KEY = "083d97120d76b70b8ad1dd40aa42740f" // Clé TMDB fournie
const BASE_URL = "https://api.themoviedb.org/3"

async function fetchPopularMovies(page = 1) {
  const url = `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=fr-FR&page=${page}`
  const res = await fetch(url)
  if (!res.ok) {
    console.error("TMDB popular error", await res.text())
    return []
  }
  try {
    const data: any = await res.json()
    return Array.isArray(data.results) ? data.results : []
  } catch (e) {
    console.error("TMDB popular parse error", e)
    return []
  }
}

async function fetchMovieDetails(tmdbId: number) {
  const url = `${BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=fr-FR`
  const res = await fetch(url)
  if (!res.ok) {
    console.error("TMDB details error", tmdbId, await res.text())
    return {}
  }
  try {
    return await res.json() as any
  } catch (e) {
    console.error("TMDB details parse error", tmdbId, e)
    return {}
  }
}

const categoryCache = new Map<string, string>() // name -> id

async function getOrCreateCategory(name: string) {
  if (categoryCache.has(name)) return categoryCache.get(name)!
  let existing = null
  try {
    existing = await db.select().from(categories).where(eq(categories.name, name)).limit(1)
  } catch (e) {
    console.error("DB select category error", name, e)
  }
  if (existing && existing[0]) {
    categoryCache.set(name, existing[0].id)
    return existing[0].id
  }
  let inserted = null
  try {
    inserted = await db.insert(categories).values({ name }).returning({ id: categories.id })
  } catch (e) {
    console.error("DB insert category error", name, e)
    return null
  }
  const id = inserted?.[0]?.id
  if (id) categoryCache.set(name, id)
  return id
}

async function importMovies() {
  let totalImported = 0
  for (let page = 1; page <= 2; page++) { // Commence par 2 pages pour debug
    const movies = await fetchPopularMovies(page)
    console.log(`Page ${page}: ${movies.length} films trouvés`)
    if (!movies.length) break
    for (const m of movies) {
      try {
        const details = await fetchMovieDetails(m.id)
        const filmRes = await db.insert(films).values({
          tmdbId: String(m.id),
          title: m.title,
          year: m.release_date?.slice(0, 4),
          posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
          synopsis: m.overview,
        }).onConflictDoNothing().returning({ id: films.id })
        const filmId = filmRes[0]?.id
        if (filmId && Array.isArray(details.genres)) {
          for (const genre of details.genres) {
            const catId = await getOrCreateCategory(genre.name)
            if (catId) {
              await db.insert(filmCategories).values({ filmId, categoryId: catId }).onConflictDoNothing()
            }
          }
        }
        totalImported++
        console.log(`Film importé: ${m.title} (${m.id})`)
      } catch (e) {
        console.error("Erreur import film", m.title, m.id, e)
      }
    }
    console.log(`Page ${page} importée (${totalImported} films au total)`)
  }
  console.log("Import terminé !")
}

importMovies()

