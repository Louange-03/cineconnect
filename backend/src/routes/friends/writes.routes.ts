import { Router, type Request, type Response } from "express"
import { db } from "../../db/client.js"
import { friendships, users } from "../../db/schema.js"
import { authMiddleware } from "../../middlewares/auth.js"
import { eq, and, or, sql } from "drizzle-orm"

export const friendsWritesRoutes = Router()

friendsWritesRoutes.post("/request", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const meId = req.user?.id
  const { userId } = req.body ?? {}

  if (!meId) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  if (!userId) {
    res.status(400).json({ message: "Missing userId" })
    return
  }

  if (userId === meId) {
    res.status(400).json({ message: "Cannot friend yourself" })
    return
  }

  const other = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1)
  if (!other.length) {
    res.status(404).json({ message: "User not found" })
    return
  }

  const existing = await db
    .select({
      id: friendships.id,
      requesterId: friendships.requesterId,
      addresseeId: friendships.addresseeId,
      status: friendships.status,
    })
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, meId), eq(friendships.addresseeId, userId)),
        and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, meId))
      )
    )
    .limit(1)

  if (existing.length) {
    const rel = existing[0]
    if (rel.status === "accepted") {
      res.status(409).json({ message: "Already friends" })
      return
    }

    if (rel.status === "pending") {
      if (rel.requesterId === userId) {
        const updated = await db
          .update(friendships)
          .set({ status: "accepted", updatedAt: sql`now()` })
          .where(eq(friendships.id, rel.id))
          .returning()
        res.json({ status: "accepted", friendship: updated[0] })
        return
      }
      res.status(409).json({ message: "Request already pending" })
      return
    }

    if (rel.status === "rejected") {
      const updated = await db
        .update(friendships)
        .set({ requesterId: meId, addresseeId: userId, status: "pending", updatedAt: sql`now()` })
        .where(eq(friendships.id, rel.id))
        .returning()
      res.json({ status: "pending", friendship: updated[0] })
      return
    }
  }

  const inserted = await db
    .insert(friendships)
    .values({ requesterId: meId, addresseeId: userId, status: "pending" })
    .returning()

  res.status(201).json({ status: "pending", friendship: inserted[0] })
})

friendsWritesRoutes.post("/accept", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const meId = req.user?.id
  const { userId } = req.body ?? {}

  if (!meId) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  if (!userId) {
    res.status(400).json({ message: "Missing userId" })
    return
  }

  const updated = await db
    .update(friendships)
    .set({ status: "accepted", updatedAt: sql`now()` })
    .where(and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, meId), eq(friendships.status, "pending")))
    .returning()

  if (!updated.length) {
    res.status(404).json({ message: "No pending request found" })
    return
  }

  res.json({ status: "accepted", friendship: updated[0] })
})

friendsWritesRoutes.post("/reject", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const meId = req.user?.id
  const { userId } = req.body ?? {}

  if (!meId) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  if (!userId) {
    res.status(400).json({ message: "Missing userId" })
    return
  }

  const updated = await db
    .update(friendships)
    .set({ status: "rejected", updatedAt: sql`now()` })
    .where(and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, meId), eq(friendships.status, "pending")))
    .returning()

  if (!updated.length) {
    res.status(404).json({ message: "No pending request found" })
    return
  }

  res.json({ status: "rejected", friendship: updated[0] })
})

friendsWritesRoutes.delete("/:userId", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const meId = req.user?.id
  const rawUserId = req.params.userId
  const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId

  if (!meId) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  await db
    .delete(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, meId), eq(friendships.addresseeId, userId)),
        and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, meId))
      )
    )

  res.json({ message: "Relation supprimée" })
})
