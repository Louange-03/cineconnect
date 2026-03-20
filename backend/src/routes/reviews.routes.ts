import { Router } from "express"
import { db } from "../db"
import { reviews, films } from "../db/schema"
import { eq, desc, and } from "drizzle-orm"
import { authMiddleware } from "../middlewares/auth"

export const reviewsRoutes = Router()

// GET /api/reviews/film/:filmId
reviewsRoutes.get("/film/:filmId", async (req, res) => {
  try {
    const { filmId } = req.params
    const filmIdInput = String(filmId).trim()
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filmIdInput)

    let resolvedFilmId = filmIdInput
    if (!isUuid) {
      const byImdb = await db
        .select({ id: films.id })
        .from(films)
        .where(eq(films.imdbId, filmIdInput))
        .limit(1)
      if (!byImdb.length) return res.json({ reviews: [] })
      resolvedFilmId = byImdb[0].id
    }

    const rows = await db
      .select()
      .from(reviews)
      .where(eq(reviews.filmId, resolvedFilmId))
      .orderBy(desc(reviews.createdAt))
      .limit(200)

    res.json({ reviews: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Erreur récupération avis" })
  }
})

// POST /api/reviews
reviewsRoutes.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id
    const rawFilmId = req.body?.filmId ?? req.body?.filmid
    const ratingNum = Number(req.body?.rating)
    const comment = req.body?.comment

    if (!userId || !rawFilmId || !Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "filmId et rating requis" })
    }

    const filmIdInput = String(rawFilmId).trim()
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filmIdInput)

    let resolvedFilmId = filmIdInput
    if (!isUuid) {
      const byImdb = await db
        .select({ id: films.id })
        .from(films)
        .where(eq(films.imdbId, filmIdInput))
        .limit(1)
      if (!byImdb.length) {
        return res.status(404).json({ message: "Film introuvable pour publier un avis" })
      }
      resolvedFilmId = byImdb[0].id
    }

    const existing = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.filmId, resolvedFilmId)))
      .limit(1)
    const hadReview = existing.length > 0

    const inserted = await db
      .insert(reviews)
      .values({
        userId,
        filmId: resolvedFilmId,
        rating: ratingNum,
        comment: comment ? String(comment) : null,
      })
      .onConflictDoUpdate({
        target: [reviews.userId, reviews.filmId],
        set: {
          rating: ratingNum,
          comment: comment ? String(comment) : null,
          updatedAt: new Date(),
        },
      })
      .returning()

    res.json({ review: inserted[0], action: hadReview ? "updated" : "created" })
  } catch (err: unknown) {
    const error = err as Error
    const msg = String(error?.message || err)
    if (msg.toLowerCase().includes("unique")) {
      return res.status(409).json({ message: "Vous avez déjà noté ce film" })
    }
    console.error(err)
    res.status(500).json({ message: "Erreur ajout avis" })
  }
})