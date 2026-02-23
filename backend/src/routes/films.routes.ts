import { Router, type Request, type Response } from "express"
import {
  listFilms,
  getFilmById,
  searchFilms,
  getCategories,
} from "../controllers/films.controller.js"

const router = Router()

// OMDb proxy endpoints (legacy, used by frontend clubbed in `omdb.ts`)
const OMDB_KEY = process.env.OMDB_API_KEY || process.env.OMDB_KEY || ""
const BASE_URL = "https://www.omdbapi.com/"

// minimal typing for OMDb responses
interface OmdbResponse {
  Response?: string
  Error?: string
  [key: string]: unknown
}

if (!OMDB_KEY) {
  console.warn("WARNING: OMDB_API_KEY not set, film search will fail")
}

// --- local database CRUD for films ---
// GET /films?q=...&category=...&year=...
router.get("/", listFilms)

// GET /films/search?q=...   (alias for list with q)
router.get("/search", searchFilms)

// GET /films/categories
router.get("/categories", getCategories)

// GET /films/:id
router.get("/:id", getFilmById)

// --- OMDb proxy endpoints (legacy, kept for backward compatibility) ---
// GET /films/tmdb?q=some
router.get("/tmdb", async (req: Request, res: Response): Promise<void> => {
  if (!OMDB_KEY) {
    res.status(500).json({ error: "OMDB_API_KEY missing on server" })
    return
  }

  const q = (req.query.q as string | undefined) || ""
  if (!q) {
    res.json({ Search: [] })
    return
  }

  try {
    const url = `${BASE_URL}?apikey=${OMDB_KEY}&s=${encodeURIComponent(q)}`
    const r = await fetch(url)
    const data = (await r.json()) as OmdbResponse
    res.json(data)
  } catch (e) {
    console.error("Error fetching from OMDb", e)
    res.status(500).json({ error: "failed to query OMDb" })
  }
})

// POST /films/tmdb/search { query }
router.post("/tmdb/search", async (req: Request, res: Response): Promise<void> => {
  console.log("/films/tmdb/search body:", req.body)
  if (!OMDB_KEY) {
    res.status(500).json({ error: "OMDB_API_KEY missing on server" })
    return
  }
  const q = (req.body.query as string | undefined) || ""
  if (!q) {
    res.json({ Search: [] })
    return
  }
  try {
    const url = `${BASE_URL}?apikey=${OMDB_KEY}&s=${encodeURIComponent(q)}`
    const r = await fetch(url)
    const data = (await r.json()) as OmdbResponse
    res.json(data)
  } catch (e) {
    console.error("Error fetching from OMDb", e)
    res.status(500).json({ error: "failed to query OMDb" })
  }
})

// GET /films/tmdb/:id
router.get("/tmdb/:id", async (req: Request, res: Response): Promise<void> => {
  let id = req.params.id
  if (Array.isArray(id)) {
    id = id[0]
  }
  try {
    const url = `${BASE_URL}?apikey=${OMDB_KEY}&i=${encodeURIComponent(id)}&plot=full`
    const r = await fetch(url)
    const data = (await r.json()) as OmdbResponse
    if (data?.Response === "False") {
      res.status(404).json({ error: data.Error || "Not found" })
    } else {
      res.json(data)
    }
  } catch (e) {
    console.error("Error fetching detail from OMDb", e)
    res.status(500).json({ error: "server" })
  }
})

// POST /films/tmdb/detail { id }
router.post("/tmdb/detail", async (req: Request, res: Response): Promise<void> => {
  const id = req.body.id as string | undefined
  if (!id) {
    res.status(400).json({ error: "id missing" })
    return
  }
  try {
    const url = `${BASE_URL}?apikey=${OMDB_KEY}&i=${encodeURIComponent(id)}&plot=full`
    const r = await fetch(url)
    const data = (await r.json()) as OmdbResponse
    if (data?.Response === "False") {
      res.status(404).json({ error: data.Error || "Not found" })
    } else {
      res.json(data)
    }
  } catch (e) {
    console.error("Error fetching detail from OMDb", e)
    res.status(500).json({ error: "server" })
  }
})

export default router
