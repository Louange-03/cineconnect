import { ilike, sql, eq, and } from "drizzle-orm"
import type { Request, Response } from "express"
import { z } from "zod"

import { db } from "../db/client.js"
import { films, categories, filmCategories } from "../db/schema.js"

// Trailer of a film row returned by list endpoints
const filmSelect = {
  id: films.id,
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
  let id = req.params.id
  if (Array.isArray(id)) id = id[0]

  const rows = await db.select().from(films).where(eq(films.id, id)).limit(1)
  const film = rows[0]

  if (!film) {
    res.status(404).json({ message: "Film not found" })
    return
  }

  // retrieve categories
  const cats = await db
    .select({ name: categories.name })
    .from(categories)
    .innerJoin(filmCategories, eq(filmCategories.categoryId, categories.id))
    .where(eq(filmCategories.filmId, film.id))

  res.json({ film: { ...film, categories: cats.map((c) => c.name) } })
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
   ✅ IMPORT OMDb -> DB locale
-------------------------------- */
const importSchema = z.object({
  imdbID: z.string().min(3),
})

export const importFilmFromOmdb = async (req: any, res: any): Promise<void> => {
  const parsed = importSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid data", errors: parsed.error.issues })
    return
  }

  const OMDB_KEY = process.env.OMDB_API_KEY || process.env.OMDB_KEY || ""
  if (!OMDB_KEY) {
    res.status(500).json({ error: "OMDB_API_KEY missing on server" })
    return
  }

  const imdbID = parsed.data.imdbID

  try {
    const url = `https://www.omdbapi.com/?apikey=${OMDB_KEY}&i=${encodeURIComponent(imdbID)}&plot=full`
    const r = await fetch(url)
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

    // Anti-doublon simple (title+year)
    const existing = await db
      .select({ id: films.id })
      .from(films)
      .where(and(eq(films.title, title), eq(films.year, year)))
      .limit(1)

    if (existing.length > 0) {
      const found = await db.select().from(films).where(eq(films.id, existing[0].id)).limit(1)
      res.json({ film: found[0], alreadyExists: true })
      return
    }

    // Insert film
    const inserted = await db
      .insert(films)
      .values({
        title,
        year,
        posterUrl,
        synopsis,
        metadata: JSON.stringify({ ...data, imdbID }),
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