import { Router, type Request, type Response } from "express"

const router = Router()

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

// GET /films?q=some
router.get("/", async (req: Request, res: Response): Promise<void> => {
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

// POST /films/search { query }
router.post("/search", async (req: Request, res: Response): Promise<void> => {
  console.log("/films/search body:", req.body)
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

// GET /films/:id
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
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

// POST /films/detail { id }
router.post("/detail", async (req: Request, res: Response): Promise<void> => {
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
