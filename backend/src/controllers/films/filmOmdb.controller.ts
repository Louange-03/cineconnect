import type { Request, Response } from "express"
import { z } from "zod"
import { eq } from "drizzle-orm"

import { db } from "../../db/client.js"
import { films, categories, filmCategories } from "../../db/schema.js"

const OMDB_API_BASE = "https://www.omdbapi.com"

function getOmdbKey(): string {
  return process.env.OMDB_API_KEY || process.env.OMDB_KEY || ""
}

export const searchOmdb = async (req: Request, res: Response): Promise<void> => {
  const q = (req.query.q ?? "").toString().trim()
  const page = Math.max(1, parseInt((req.query.page as string) ?? "1", 10) || 1)

  const OMDB_KEY = getOmdbKey()
  if (!OMDB_KEY) {
    res.status(500).json({ error: "OMDB_API_KEY missing on server" })
    return
  }

  if (!q) {
    res.json({ Response: "True", Search: [], totalResults: "0" })
    return
  }

  try {
    const url = `${OMDB_API_BASE}/?apikey=${OMDB_KEY}&s=${encodeURIComponent(q)}&page=${page}`
    const r = await fetch(url)
    const data = (await r.json()) as { Response: string; Search?: unknown[]; totalResults?: string; Error?: string }
    if (data?.Response === "False") {
      res.json({ Response: "False", Search: [], Error: data?.Error })
      return
    }
    res.json({ Response: "True", Search: data?.Search ?? [], totalResults: data?.totalResults ?? "0" })
  } catch (e) {
    console.error("searchOmdb error:", e)
    res.status(500).json({ error: "OMDb request failed" })
  }
}

const importSchema = z.object({
  imdbID: z.string().min(3),
})

export const importFilmFromOmdb = async (req: Request, res: Response): Promise<void> => {
  const parsed = importSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid data", errors: parsed.error.issues })
    return
  }

  const OMDB_KEY = getOmdbKey()
  if (!OMDB_KEY) {
    res.status(500).json({ error: "OMDB_API_KEY missing on server" })
    return
  }

  const imdbID = parsed.data.imdbID

  try {
    const url = `https://www.omdbapi.com/?apikey=${OMDB_KEY}&i=${encodeURIComponent(imdbID)}&plot=full`
    const r = await fetch(url)
    const data = (await r.json()) as Record<string, unknown>

    if (data.Response === "False") {
      res.status(404).json({ error: typeof data.Error === "string" ? data.Error : "Not found" })
      return
    }

    const title = String(data.Title ?? "").trim()
    const year = String(data.Year ?? "").trim()
    const posterRaw = String(data.Poster ?? "")
    const plotRaw = String(data.Plot ?? "")
    const posterUrl = posterRaw && posterRaw !== "N/A" ? posterRaw : null
    const synopsis = plotRaw && plotRaw !== "N/A" ? plotRaw : null
    const genreRaw = String(data.Genre ?? "")

    const genres = genreRaw
      .split(",")
      .map((g: string) => g.trim())
      .filter(Boolean)

    if (!title) {
      res.status(400).json({ error: "OMDb returned empty title" })
      return
    }

    const existing = await db
      .select({ id: films.id })
      .from(films)
      .where(eq(films.imdbId, imdbID))
      .limit(1)

    if (existing.length > 0) {
      const found = await db.select().from(films).where(eq(films.id, existing[0].id)).limit(1)
      res.json({ film: found[0], alreadyExists: true })
      return
    }

    const metadataJson = typeof data === "object" ? JSON.stringify(data) : ""

    const inserted = await db
      .insert(films)
      .values({
        imdbId: imdbID,
        title: title,
        year: year,
        posterUrl: posterUrl,
        synopsis: synopsis,
        metadata: metadataJson,
      })
      .returning()

    const film = inserted[0]

    for (const g of genres) {
      const cat = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.name, g))
        .limit(1)

      let catId = cat[0]?.id

      if (!catId) {
        const created = await db.insert(categories).values({ name: g }).returning()
        catId = created[0].id
      }

      await db.insert(filmCategories).values({
        filmId: film.id,
        categoryId: catId,
      })
    }

    res.status(201).json({ film: { ...film, categories: genres } })
  } catch (e) {
    console.error("importFilmFromOmdb error:", e)
    res.status(500).json({ error: "server" })
  }
}
