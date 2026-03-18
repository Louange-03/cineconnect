import { Router } from "express"
import { db } from "../db"
import { reviews } from "../db/schema"
import { eq, desc, and } from "drizzle-orm"
import { authMiddleware } from "../middlewares/auth"

export const reviewsRoutes = Router()

// GET /api/reviews/film/:filmId
reviewsRoutes.get("/film/:filmId", async (req, res) => {
  try {
    const { filmId } = req.params
    const rows = await db
      .select()
      .from(reviews)
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

    res.json({ review: inserted[0] })
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

// PUT /api/reviews/:id
reviewsRoutes.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id
    const { id } = req.params
    const { rating, comment } = req.body ?? {}

    if (typeof rating !== "number") {
      return res.status(400).json({ message: "rating requis" })
    }

    const updated = await db
      .update(reviews)
      .set({ rating, comment: comment ? String(comment) : null })
      .where(and(eq(reviews.id, id), eq(reviews.userId, userId)))
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
    const { id } = req.params

    const deleted = await db
      .delete(reviews)
      .where(and(eq(reviews.id, id), eq(reviews.userId, userId)))
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