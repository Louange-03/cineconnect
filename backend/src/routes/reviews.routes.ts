import { Router } from "express"
import { db } from "../db"
import { reviews, users } from "../db/schema"
import { eq, desc, sql } from "drizzle-orm"
import { authMiddleware } from "../middlewares/auth"

export const reviewsRoutes = Router()

// Autorise plusieurs avis par utilisateur sur un meme film.
void db
  .execute(sql`drop index if exists reviews_user_film_unique`)
  .catch((err) => console.error("drop reviews_user_film_unique failed:", err))

// GET /api/reviews/film/:filmId
reviewsRoutes.get("/film/:filmId", async (req, res) => {
  try {
    const { filmId } = req.params
    const rows = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        filmId: reviews.filmId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        username: users.username,
      })
      .from(reviews)
      .innerJoin(users, eq(users.id, reviews.userId))
      .where(eq(reviews.filmId, filmId))
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
    const userId = req.user!.id
    const { filmId, rating, comment } = req.body ?? {}

    if (!filmId || typeof rating !== "number") {
      return res.status(400).json({ message: "filmId, rating requis" })
    }

    const inserted = await db
      .insert(reviews)
      .values({
        userId,
        filmId,
        rating,
        comment: comment ? String(comment) : null,
      })
      .returning()

    res.status(201).json({ action: "created", review: inserted[0] })
  } catch (err: unknown) {
    console.error(err)
    res.status(500).json({ message: "Erreur ajout avis" })
  }
})

// PUT /api/reviews/:id
reviewsRoutes.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id
    const raw = req.params.id
    const id = Array.isArray(raw) ? raw[0] : raw
    const { rating, comment } = req.body ?? {}

    if (typeof rating !== "number") {
      return res.status(400).json({ message: "rating requis" })
    }

    const existing = await db
      .select({ id: reviews.id, userId: reviews.userId })
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1)

    if (!existing.length) {
      return res.status(404).json({ message: "Avis introuvable" })
    }

    if (existing[0].userId !== userId) {
      return res.status(403).json({ message: "Vous ne pouvez modifier que votre propre avis" })
    }

    const updated = await db
      .update(reviews)
      .set({ rating, comment: comment ? String(comment) : null })
      .where(eq(reviews.id, id))
      .returning()

    if (!updated.length) {
      return res.status(404).json({ message: "Avis introuvable ou non autorisé" })
    }

    res.json({ review: updated[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Erreur modification avis" })
  }
})

// DELETE /api/reviews/:id
reviewsRoutes.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id
    const raw = req.params.id
    const id = Array.isArray(raw) ? raw[0] : raw

    const existing = await db
      .select({ id: reviews.id, userId: reviews.userId })
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1)

    if (!existing.length) {
      return res.status(404).json({ message: "Avis introuvable" })
    }

    if (existing[0].userId !== userId) {
      return res.status(403).json({ message: "Vous ne pouvez supprimer que votre propre avis" })
    }

    const deleted = await db
      .delete(reviews)
      .where(eq(reviews.id, id))
      .returning()

    if (!deleted.length) {
      return res.status(404).json({ message: "Avis introuvable ou non autorisé" })
    }

    res.json({ message: "Avis supprimé" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Erreur suppression avis" })
  }
})