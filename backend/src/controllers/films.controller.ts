import { ilike, sql, eq } from "drizzle-orm"
import type { Request, Response } from "express"

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
    // apply IN clause
    query = query.where(sql`${films.id} IN (${sql.join(idsFilter.map((id) => sql`${id}`), ",")})`)
  }

  query = query.limit(limit)

  const rows = await query
  res.json({ films: rows })
}

export const getFilmById = async (req: Request, res: Response): Promise<void> => {
  let id = req.params.id
  if (Array.isArray(id)) id = id[0]

  const rows = await db
    .select()
    .from(films)
    .where(eq(films.id, id))
    .limit(1)

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
