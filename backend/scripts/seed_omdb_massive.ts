/**
 * Script d'import massif depuis l'API OMDb.
 * Remplit la base avec un maximum de films (recherche par termes + détail par imdbID).
 * Résumable : ignore les films déjà présents (imdbId).
 * Clé API : OMDB_API_KEY dans backend/.env (ex: 1df456d6)
 *
 * Limite OMDb gratuite : 1000 requêtes/jour. Pour ~80k films, relancer plusieurs jours
 * ou utiliser un abonnement OMDb (plus de requêtes/jour).
 *
 * Usage: depuis la racine du projet —
 *   npx tsx backend/scripts/seed_omdb_massive.ts
 * Ou depuis backend/ : npx tsx scripts/seed_omdb_massive.ts
 */
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config()
dotenv.config({ path: path.resolve(__dirname, "../.env") })
import { db } from "../src/db"
import { films, categories, filmCategories } from "../src/db/schema"
import { eq } from "drizzle-orm"

const OMDB_API_KEY = process.env.OMDB_API_KEY || process.env.OMDB_KEY || "1df456d6"
const OMDB_BASE = "https://www.omdbapi.com"
const DELAY_MS = 280
const MAX_PAGES_PER_TERM = 100

const GENRE_MAP: Record<string, string> = {
  Action: "Action",
  Adventure: "Aventure",
  Animation: "Animation",
  Biography: "Biographie",
  Comedy: "Comédie",
  Crime: "Crime",
  Documentary: "Documentaire",
  Drama: "Drame",
  Family: "Familial",
  Fantasy: "Fantastique",
  Horror: "Horreur",
  Mystery: "Mystère",
  Romance: "Romance",
  "Sci-Fi": "Science-Fiction",
  Sport: "Sport",
  Thriller: "Thriller",
  War: "Guerre",
  Western: "Western",
}

const SEARCH_TERMS = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
  "the", "love", "man", "woman", "life", "death", "night", "day", "star", "world",
  "american", "dark", "black", "white", "red", "blue", "king", "queen",
  "house", "road", "city", "blood", "heart", "time", "last", "first",
  "big", "little", "new", "old", "young", "dead", "live", "lost", "found",
  "secret", "final", "true", "long", "high", "cold", "hot", "fire", "ice",
  "war", "game", "dog", "cat", "boy", "girl", "alien", "space", "future",
  "summer", "winter", "spring", "fall", "water", "earth", "wind", "sun", "moon",
  "1", "2", "3", "4", "5", "6", "7", "8", "9",
]

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function searchOmdb(term: string, page: number): Promise<{ imdbID: string; Title: string; Year: string }[]> {
  const url = `${OMDB_BASE}/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(term)}&page=${page}`
  const res = await fetch(url)
  const data = (await res.json()) as { Response: string; Search?: { imdbID: string; Title: string; Year: string }[]; Error?: string }
  if (data?.Response !== "True" || !Array.isArray(data.Search)) return []
  return data.Search
}

async function getDetail(imdbID: string): Promise<{
  imdbID: string
  Title: string
  Year: string
  Poster?: string
  Plot?: string
  Genre?: string
  Type?: string
  Response?: string
  Error?: string
} | null> {
  const url = `${OMDB_BASE}/?apikey=${OMDB_API_KEY}&i=${encodeURIComponent(imdbID)}&plot=short`
  const res = await fetch(url)
  const data = (await res.json()) as {
    imdbID: string
    Title: string
    Year: string
    Poster?: string
    Plot?: string
    Genre?: string
    Type?: string
    Response?: string
    Error?: string
  }
  if (data?.Response === "False" || data?.Error) return null
  return data
}

async function seedMassive(): Promise<void> {
  console.log("Import massif OMDb — clé API:", OMDB_API_KEY ? `${OMDB_API_KEY.slice(0, 4)}…` : "MANQUANTE")
  if (!OMDB_API_KEY) {
    console.error("Définir OMDB_API_KEY dans .env (ex: 1df456d6)")
    process.exit(1)
  }

  let imported = 0
  let limitReached = false
  let requestCount = 0

  for (const term of SEARCH_TERMS) {
    if (limitReached) break

    for (let page = 1; page <= MAX_PAGES_PER_TERM; page++) {
      if (limitReached) break

      try {
        const list = await searchOmdb(term, page)
        requestCount++
        await sleep(DELAY_MS)

        if (list.length === 0) break

        for (const item of list) {
          if (limitReached) break
          const imdbID = item?.imdbID
          if (!imdbID) continue

          const existing = await db.select({ id: films.id }).from(films).where(eq(films.imdbId, imdbID)).limit(1)
          if (existing.length > 0) continue

          const data = await getDetail(imdbID)
          requestCount++
          await sleep(DELAY_MS)

          if (!data || data.Response === "False") {
            if (data?.Error?.toLowerCase().includes("limit")) limitReached = true
            continue
          }

          const title = (data.Title || "").trim()
          if (!title) continue

          const posterUrl = data.Poster && data.Poster !== "N/A" ? data.Poster : null
          const synopsis = data.Plot && data.Plot !== "N/A" ? data.Plot : null

          const [newFilm] = await db
            .insert(films)
            .values({
              imdbId: data.imdbID,
              title,
              year: data.Year || null,
              posterUrl,
              synopsis,
              metadata: JSON.stringify(data),
            })
            .returning()

          const genreString = data.Genre || ""
          const rawGenres = genreString.split(",").map((g: string) => g.trim()).filter(Boolean)
          const mappedGenres = new Set<string>()
          if (data.Type === "series") mappedGenres.add("Série")
          if (data.Type === "movie") mappedGenres.add("Movie")
          for (const g of rawGenres) {
            mappedGenres.add(GENRE_MAP[g] ?? g)
          }

          for (const g of Array.from(mappedGenres)) {
            let cats = await db.select().from(categories).where(eq(categories.name, g)).limit(1)
            let cat = cats[0]
            if (!cat) {
              const inserted = await db.insert(categories).values({ name: g }).returning()
              cat = inserted[0]
            }
            await db
              .insert(filmCategories)
              .values({ filmId: newFilm.id, categoryId: cat.id })
              .onConflictDoNothing()
          }

          imported++
          if (imported % 50 === 0) console.log(`  … ${imported} films importés (requêtes: ~${requestCount})`)
        }
      } catch (e) {
        const err = e as Error
        if (err?.message?.toLowerCase().includes("limit")) limitReached = true
        console.error("Erreur:", err?.message ?? e)
      }
    }
  }

  console.log("\n--- Import terminé ---")
  console.log("Nouveaux films ajoutés:", imported)
  console.log("(Relancer demain pour continuer; limite OMDb gratuite ~1000 req/jour)")
  process.exit(0)
}

seedMassive()
