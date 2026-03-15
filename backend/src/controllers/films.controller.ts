import { ilike, sql, eq, and } from "drizzle-orm"
import type { Request, Response } from "express"
import { z } from "zod"

import { db } from "../db/client.js"
import { films, categories, filmCategories } from "../db/schema.js"

// Trailer of a film row returned by list endpoints
const filmSelect = {
  id: films.id,
  imdbId: films.imdbId,
  title: films.title,
  year: films.year,
  posterUrl: films.posterUrl,
  synopsis: films.synopsis,
  metadata: films.metadata,
}

export const listFilms = async (req: Request, res: Response): Promise<void> => {
  const q = (req.query.q ?? "").toString().trim()
  const category = (req.query.category ?? "").toString().trim()
  const year = (req.query.year ?? "").toString().trim()
  const limitParam = req.query.limit as string | undefined
  const limit = Math.min(parseInt(limitParam ?? "50", 10) || 50, 100)

  // build base query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = db.select(filmSelect).from(films)

  if (q) {
    query = query.where(ilike(films.title, `%${q}%`))
  }

  if (year) {
    query = query.where(eq(films.year, year))
  }

  if (category) {
    // find category id
    const catRow = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.name, category))
      .limit(1)

    if (catRow.length === 0) {
      res.json({ films: [] })
      return
    }

    const catId = catRow[0].id
    const fcRows = await db
      .select({ filmId: filmCategories.filmId })
      .from(filmCategories)
      .where(eq(filmCategories.categoryId, catId))

    const idsFilter = fcRows.map((r) => r.filmId)
    if (idsFilter.length === 0) {
      res.json({ films: [] })
      return
    }

    query = query.where(
      sql`${films.id} IN (${sql.join(idsFilter.map((id) => sql`${id}`), ",")})`
    )
  }

  query = query.limit(limit)

  const rows = await query
  res.json({ films: rows })
}

export const getFilmById = async (req: Request, res: Response): Promise<void> => {
  try {
    let id = req.params.id
    if (Array.isArray(id)) id = id[0]
    id = typeof id === "string" ? id.trim() : ""

    if (!id) {
      res.status(400).json({ message: "Invalid ID" })
      return
    }

    // Chercher par UUID (id) ou par imdbId (ex: tt0133093)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    let rows = await db
      .select()
      .from(films)
      .where(isUuid ? eq(films.id, id) : eq(films.imdbId, id))
      .limit(1)
    let film = rows[0]

    if (!film) {
      // Fallback : si on a passé un UUID et pas trouvé, essayer comme imdbId (et inversement)
      rows = await db
        .select()
        .from(films)
        .where(isUuid ? eq(films.imdbId, id) : eq(films.id, id))
        .limit(1)
      film = rows[0]
    }

    if (!film) {
      res.status(404).json({ message: "Film non trouvé" })
      return
    }

    const cats = await db
      .select({ name: categories.name })
      .from(categories)
      .innerJoin(filmCategories, eq(filmCategories.categoryId, categories.id))
      .where(eq(filmCategories.filmId, film.id))

    res.json({ film: { ...film, categories: cats.map((c) => c.name) } })
  } catch (err) {
    console.error("Erreur getFilmById:", err)
    res.status(500).json({ message: "Erreur récupération film" })
  }
}

export const searchFilms = async (req: Request, res: Response): Promise<void> => {
  const q = (req.query.q ?? "").toString().trim()
  if (!q) {
    res.json({ films: [] })
    return
  }

  const rows = await db
    .select(filmSelect)
    .from(films)
    .where(ilike(films.title, `%${q}%`))
    .limit(50)

  res.json({ films: rows })
}

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(categories).orderBy(categories.name)
  res.json({ categories: rows })
}

/* -----------------------------
   OMDb API : recherche externe (pour import)
-------------------------------- */
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

/* -----------------------------
   IMPORT OMDb -> DB locale (par imdbID)
-------------------------------- */
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await r.json()

    if (data?.Response === "False") {
      res.status(404).json({ error: data?.Error || "Not found" })
      return
    }

    const title = (data?.Title || "").toString().trim()
    const year = (data?.Year || "").toString().trim()
    const posterUrl = data?.Poster && data.Poster !== "N/A" ? data.Poster : null
    const synopsis = data?.Plot && data.Plot !== "N/A" ? data.Plot : null
    const genreRaw = (data?.Genre || "").toString()

    const genres = genreRaw
      .split(",")
      .map((g: string) => g.trim())
      .filter(Boolean)

    if (!title) {
      res.status(400).json({ error: "OMDb returned empty title" })
      return
    }

    // Anti-doublon par imdbId (unique)
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

    // Upsert categories + join
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

      // link film-category
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