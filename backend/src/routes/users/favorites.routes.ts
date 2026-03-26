import { Router, type Request, type Response } from "express"
import { db } from "../../db"
import { favorites, films } from "../../db/schema"
import { authMiddleware } from "../../middlewares/auth"
import { and, eq } from "drizzle-orm"
import { resolveFilmId } from "./lib.js"

export const usersFavoritesRoutes = Router()

usersFavoritesRoutes.get("/me/favorites", authMiddleware, async (req: Request, res: Response) => {
  try {
    const meId = req.user!.id

    const list = await db
      .select({
        id: films.id,
        imdbId: films.imdbId,
        title: films.title,
        year: films.year,
        posterUrl: films.posterUrl,
      })
      .from(favorites)
      .innerJoin(films, eq(favorites.filmId, films.id))
      .where(eq(favorites.userId, meId))
      .orderBy(favorites.createdAt)

    res.json({ favorites: list })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Erreur récupération favoris" })
  }
})

usersFavoritesRoutes.post("/me/favorites/:filmId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const meId = req.user!.id
    const rawFilmId = req.params.filmId
    const filmIdParam = Array.isArray(rawFilmId) ? rawFilmId[0] : rawFilmId
    const resolvedFilmId = await resolveFilmId(filmIdParam)
    if (!resolvedFilmId) {
      return res.status(404).json({ message: "Film introuvable" })
    }

    await db.insert(favorites).values({
      userId: meId,
      filmId: resolvedFilmId,
    }).onConflictDoNothing()

    res.json({ success: true })
  } catch (err) {
    console.error("Erreur ajout favori:", err)
    res.status(500).json({ message: "Erreur ajout favori" })
  }
})

usersFavoritesRoutes.delete("/me/favorites/:filmId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const meId = req.user!.id
    const filmId = req.params.filmId as string
    const resolvedFilmId = await resolveFilmId(filmId)
    if (!resolvedFilmId) {
      return res.status(404).json({ message: "Film introuvable" })
    }

    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, meId), eq(favorites.filmId, resolvedFilmId)))

    res.json({ success: true })
  } catch (err) {
    console.error("Erreur suppression favori:", err)
    res.status(500).json({ message: "Erreur suppression favori" })
  }
})
