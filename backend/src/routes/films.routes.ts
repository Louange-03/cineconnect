import { Router } from "express"
import { db } from "../db"
import { films, filmCategories, categories } from "../db/schema"
import { eq, ilike, inArray, and, type SQL } from "drizzle-orm"
import { getFilmById, importFilmFromOmdb } from "../controllers/films.controller"

export const filmsRoutes = Router()

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
    const limit = toNumberQuery(req.query.limit, 60)

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

    let resultFilms;
    if (whereParts.length > 0) {
      resultFilms = await db.select().from(films).where(and(...whereParts)).limit(limit);
    } else {
      resultFilms = await db.select().from(films).limit(limit);
    }

    const filmIds = resultFilms.map(f => f.id);
    let filmsWithCategories: any[] = resultFilms.map(f => ({ ...f, categories: [] as string[] }));

    if (filmIds.length > 0) {
      const allLinks = await db
        .select({
          filmId: filmCategories.filmId,
          categoryName: categories.name
        })
        .from(filmCategories)
        .innerJoin(categories, eq(filmCategories.categoryId, categories.id))
        .where(inArray(filmCategories.filmId, filmIds));

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

filmsRoutes.get("/tmdb", async (req, res) => {
  try {
    const q = (req.query.q ?? "").toString().trim()
    if (!q) return res.json({ Search: [] })

    const OMDB_KEY = process.env.OMDB_API_KEY || ""
    if (!OMDB_KEY) return res.status(500).json({ error: "OMDB_API_KEY manquant" })

    const url = `https://www.omdbapi.com/?apikey=${OMDB_KEY}&s=${encodeURIComponent(q)}`
    const r = await fetch(url)
    const data = await r.json()
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erreur recherche OMDb" })
  }
})


filmsRoutes.post("/import", importFilmFromOmdb)

filmsRoutes.get("/:id", getFilmById)