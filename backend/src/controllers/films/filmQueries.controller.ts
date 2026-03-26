import { eq } from "drizzle-orm"
import type { Request, Response } from "express"

import { db } from "../../db/client.js"
import { films, categories, filmCategories } from "../../db/schema.js"

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
