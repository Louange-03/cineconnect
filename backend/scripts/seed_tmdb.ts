import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"
import { eq } from "drizzle-orm"
import { db } from "../src/db"
import { films, categories, filmCategories } from "../src/db/schema"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config()
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true })

const TMDB_API_KEY = (process.env.TMDB_API_KEY ?? "").trim()
const TMDB_BASE = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w780"
const PAGES = Math.max(1, Number(process.env.SEED_TMDB_PAGES ?? "30"))
const LANGUAGE = (process.env.SEED_TMDB_LANGUAGE ?? "fr-FR").trim()
const DELAY_MS = Math.max(0, Number(process.env.SEED_TMDB_DELAY_MS ?? "120"))
const SOURCES = (process.env.SEED_TMDB_SOURCES ?? "popular,now_playing,upcoming")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean)

const ALLOWED_SOURCES = ["popular", "now_playing", "upcoming", "top_rated"] as const
type TmdbSource = (typeof ALLOWED_SOURCES)[number]

type TmdbMovie = {
  id: number
  title?: string
  release_date?: string
  overview?: string
  poster_path?: string | null
}

type TmdbMovieDetails = {
  id: number
  genres?: Array<{ id: number; name: string }>
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchMovies(source: TmdbSource, page: number): Promise<TmdbMovie[]> {
  const url = `${TMDB_BASE}/movie/${source}?api_key=${TMDB_API_KEY}&language=${encodeURIComponent(LANGUAGE)}&page=${page}`
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`TMDB ${source} page=${page} error ${res.status}: ${text}`)
  }
  const data = (await res.json()) as { results?: TmdbMovie[] }
  return Array.isArray(data.results) ? data.results : []
}

async function fetchMovieDetails(tmdbId: number): Promise<TmdbMovieDetails | null> {
  const url = `${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=${encodeURIComponent(LANGUAGE)}`
  const res = await fetch(url)
  if (!res.ok) return null
  return (await res.json()) as TmdbMovieDetails
}

async function getOrCreateCategory(name: string): Promise<string | null> {
  const n = name.trim()
  if (!n) return null
  const existing = await db.select({ id: categories.id }).from(categories).where(eq(categories.name, n)).limit(1)
  if (existing[0]?.id) return existing[0].id
  const inserted = await db.insert(categories).values({ name: n }).returning({ id: categories.id })
  return inserted[0]?.id ?? null
}

async function run(): Promise<void> {
  if (!TMDB_API_KEY) {
    console.error("TMDB_API_KEY manquant dans backend/.env")
    process.exit(1)
  }

  const sources = SOURCES.filter((s): s is TmdbSource =>
    (ALLOWED_SOURCES as readonly string[]).includes(s),
  )
  const uniqueSources = [...new Set(sources)]
  if (!uniqueSources.length) {
    console.error(`[seed:tmdb] aucune source valide. Utiliser: ${ALLOWED_SOURCES.join(",")}`)
    process.exit(1)
  }

  console.log(
    `[seed:tmdb] start pages=${PAGES}, lang=${LANGUAGE}, sources=${uniqueSources.join(",")}`,
  )
  let imported = 0
  let scanned = 0
  const seenTmdbIds = new Set<number>()

  for (const source of uniqueSources) {
    for (let page = 1; page <= PAGES; page++) {
      const list = await fetchMovies(source, page)
      if (!list.length) {
        console.log(`[seed:tmdb] ${source} page ${page}: 0 résultat`)
        break
      }

      for (const movie of list) {
        if (seenTmdbIds.has(movie.id)) continue
        seenTmdbIds.add(movie.id)
        scanned++

        const tmdbId = String(movie.id)
        const title = (movie.title ?? "").trim()
        if (!title) continue

        const exists = await db.select({ id: films.id }).from(films).where(eq(films.imdbId, tmdbId)).limit(1)
        if (exists.length > 0) continue

        const details = await fetchMovieDetails(movie.id)
        const year = (movie.release_date ?? "").slice(0, 4) || null
        const posterUrl = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null
        const synopsis = movie.overview?.trim() || null

        const [inserted] = await db
          .insert(films)
          .values({
            imdbId: tmdbId,
            title,
            year,
            posterUrl,
            synopsis,
            metadata: JSON.stringify({
              source: "catalog",
              type: "movie",
              tmdbId: movie.id,
              tmdbList: source,
            }),
          })
          .returning({ id: films.id })

        const genres = Array.isArray(details?.genres) ? details!.genres : []
        for (const g of genres) {
          const catId = await getOrCreateCategory(g.name)
          if (!catId) continue
          await db
            .insert(filmCategories)
            .values({ filmId: inserted.id, categoryId: catId })
            .onConflictDoNothing()
        }

        imported++
        await sleep(DELAY_MS)
      }

      console.log(`[seed:tmdb] ${source} page ${page}/${PAGES} OK`)
    }
  }

  console.log(`[seed:tmdb] terminé, films scannés=${scanned}, nouveaux importés=${imported}`)
  process.exit(0)
}

run().catch((err) => {
  console.error("[seed:tmdb] erreur:", err)
  process.exit(1)
})

