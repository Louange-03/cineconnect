import { Router } from "express"
import { db } from "../db"
import { films, filmCategories, categories } from "../db/schema"
import { eq, ilike, inArray, and, asc, type SQL } from "drizzle-orm"
import { getFilmById, searchOmdb, importFilmFromOmdb } from "../controllers/films.controller"
import { authMiddleware } from "../middlewares/auth"
import type { InferSelectModel } from "drizzle-orm"

export const filmsRoutes = Router()
type FilmRow = InferSelectModel<typeof films>



function toStringQuery(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function toNumberQuery(value: unknown, fallback: number): number {
  if (typeof value !== "string") return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const DEFAULT_FILMS_LIMIT = 2000
const MAX_FILMS_LIMIT = 10000

filmsRoutes.get("/", async (req, res) => {
  try {
    const q = toStringQuery(req.query.q).trim()
    const category = toStringQuery(req.query.category).trim()
    const rawLimit = toNumberQuery(req.query.limit, DEFAULT_FILMS_LIMIT)
    const limit = Math.min(Math.max(rawLimit, 1), MAX_FILMS_LIMIT)

    const whereParts: SQL[] = []

    if (q) {
      whereParts.push(ilike(films.title, `%${q}%`))
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

    let resultFilms
    if (whereParts.length > 0) {
      resultFilms = await db
        .select()
        .from(films)
        .where(and(...whereParts))
        .orderBy(asc(films.title))
        .limit(limit)
    } else {
      resultFilms = await db.select().from(films).orderBy(asc(films.title)).limit(limit)
    }

    // Now manually attach categories (since SQLite/PG array_agg can be tricky to type cleanly with simple select)
    // We can do a second query to get all categories for the returning films
    const filmIds = resultFilms.map(f => f.id);
    let filmsWithCategories: Array<FilmRow & { categories: string[] }> =
      resultFilms.map((f) => ({ ...f, categories: [] as string[] }))

    if (filmIds.length > 0) {
      const allLinks = await db
        .select({
          filmId: filmCategories.filmId,
          categoryName: categories.name
        })
        .from(filmCategories)
        .innerJoin(categories, eq(filmCategories.categoryId, categories.id))
        .where(inArray(filmCategories.filmId, filmIds));

      // grouped
      const catsMap = new Map<string, string[]>();
      for (const link of allLinks) {
        if (!catsMap.has(link.filmId)) catsMap.set(link.filmId, []);
        catsMap.get(link.filmId)!.push(link.categoryName);
      }

      filmsWithCategories = resultFilms.map(f => ({
        ...f,
        categories: catsMap.get(f.id) || []
      }));
    }

    res.json({ films: filmsWithCategories })
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

// Recherche OMDb (externe) pour l’import — avant /:id
filmsRoutes.get("/omdb/search", searchOmdb)
filmsRoutes.post("/import", authMiddleware, importFilmFromOmdb)

filmsRoutes.get("/:id", getFilmById)