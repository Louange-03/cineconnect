import { eq, and } from "drizzle-orm"
import type { Request, Response } from "express"
import { z } from "zod"

import { db } from "../db/client.js"
import { reviews } from "../db/schema.js"

const createSchema = z.object({
  filmId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

const updateSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
})

export const createReview = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid data", errors: parsed.error.issues })
    return
  }

  try {
    const inserted = await db
      .insert(reviews)
      .values({ userId, ...parsed.data })
      .returning()

    res.status(201).json({ review: inserted[0] })
  } catch {
    res.status(500).json({ error: "server" })
  }
}

export const getReview = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string
  const row = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1)
  if (!row[0]) {
    res.status(404).json({ error: "not found" })
    return
  }
  res.json({ review: row[0] })
}

export const getReviewsByFilm = async (req: Request, res: Response): Promise<void> => {
  const filmId = req.params.filmId as string
  const rows = await db.select().from(reviews).where(eq(reviews.filmId, filmId))
  res.json({ reviews: rows })
}

export const getReviewsByUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.userId as string
  const rows = await db.select().from(reviews).where(eq(reviews.userId, userId))
  res.json({ reviews: rows })
}

export const updateReview = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string
  const userId = req.user!.id
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid data", errors: parsed.error.issues })
    return
  }
  try {
    const updated = await db
      .update(reviews)
      .set(parsed.data)
      .where(and(eq(reviews.id, id), eq(reviews.userId, userId)))
      .returning()

    if (updated.length === 0) {
      res.status(404).json({ error: "not found or not authorized" })
      return
    }
    res.json({ review: updated[0] })
  } catch {
    res.status(500).json({ error: "server" })
  }
}

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string
  const userId = req.user!.id
  try {
    const deleted = await db
      .delete(reviews)
      .where(and(eq(reviews.id, id), eq(reviews.userId, userId)))
      .returning()
    if (deleted.length === 0) {
      res.status(404).json({ error: "not found or not authorized" })
      return
    }
    res.json({ review: deleted[0] })
  } catch {
    res.status(500).json({ error: "server" })
  }
}
