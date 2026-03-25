import { ilike, sql, eq, and, asc, type SQL } from "drizzle-orm"
import type { Request, Response } from "express"

import { db } from "../../db/client.js"
import { films, categories, filmCategories } from "../../db/schema.js"

export const filmSelect = {
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

  const whereClauses: SQL[] = []

  if (q) {
    whereClauses.push(ilike(films.title, `%${q}%`))
  }

  if (year) {
    whereClauses.push(eq(films.year, year))
  }

  if (category) {
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

    whereClauses.push(sql`${films.id} IN (${sql.join(idsFilter.map((id) => sql`${id}`), sql`,`)})`)
  }

  const rows =
    whereClauses.length > 0
      ? await db.select(filmSelect).from(films).where(and(...whereClauses)).limit(limit)
      : await db.select(filmSelect).from(films).limit(limit)
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

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    let rows = await db
      .select()
      .from(films)
      .where(isUuid ? eq(films.id, id) : eq(films.imdbId, id))
      .limit(1)
    let film = rows[0]

    if (!film) {
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
  const rows = await db.select().from(categories).orderBy(asc(categories.name))
  res.json({ categories: rows })
}
