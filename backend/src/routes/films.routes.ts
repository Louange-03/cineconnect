import { Router } from "express"
import { db } from "../db"
import { films, filmCategories, categories } from "../db/schema"
import { eq, ilike, inArray, and, type SQL } from "drizzle-orm"

export const filmsRoutes = Router()

type FilmType = "movie" | "series" | "all"

function toStringQuery(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function toNumberQuery(value: unknown, fallback: number): number {
  if (typeof value !== "string") return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

filmsRoutes.get("/", async (req, res) => {
  try {
    const q = toStringQuery(req.query.q).trim()
    const category = toStringQuery(req.query.category).trim()
    const type = (toStringQuery(req.query.type) || "all") as FilmType
    const limit = toNumberQuery(req.query.limit, 60)

    const whereParts: SQL[] = []

    if (q) {
      whereParts.push(ilike(films.title, `%${q}%`))
    }

    if (type !== "all") {
      // films.type est un enum "movie" | "series"
      whereParts.push(eq(films.type, type))
    }

    if (category) {
      const cat = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.name, category))
        .limit(1)

      if (!cat.length) {
        // catégorie inconnue => 0 résultats
        return res.json({ films: [] })
      }

      const links = await db
        .select({ filmId: filmCategories.filmId })
        .from(filmCategories)
        .where(eq(filmCategories.categoryId, cat[0].id))

      const filmIds = links.map((l) => l.filmId)

      if (filmIds.length === 0) {
        return res.json({ films: [] })
      }

      whereParts.push(inArray(films.id, filmIds))
    }

    const query = db.select().from(films)

    const result =
      whereParts.length > 0
        ? await query.where(and(...whereParts)).limit(limit)
        : await query.limit(limit)

    res.json({ films: result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Erreur récupération films" })
  }
})

filmsRoutes.get("/categories", async (_req, res) => {
  try {
    const list = await db.select().from(categories).orderBy(categories.name)
    res.json({ categories: list })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Erreur récupération catégories" })
  }
})