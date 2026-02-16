import { Router } from "express"
import { db } from "../db/client.js"
import { friendships, users } from "../db/schema.js"
import { authMiddleware } from "../middlewares/auth.js"
import { eq, and, or, sql } from "drizzle-orm"

const router = Router()

// GET /friends -> amis (accepted)
router.get("/", authMiddleware, async (req, res) => {
  const meId = req.user.id

  const rows = await db.execute(sql`
    select
      u.id,
      u.username,
      u.created_at as "createdAt"
    from friendships f
    join users u on u.id = case
      when f.requester_id = ${meId} then f.addressee_id
      else f.requester_id
    end
    where (f.requester_id = ${meId} or f.addressee_id = ${meId})
      and f.status = 'accepted'
    order by u.username asc
  `)

  res.json({ friends: rows?.rows ?? rows })
})

// GET /friends/requests -> demandes reçues (pending)
router.get("/requests", authMiddleware, async (req, res) => {
  const meId = req.user.id

  const rows = await db
    .select({
      friendshipId: friendships.id,
      fromUserId: users.id,
      fromUsername: users.username,
      createdAt: friendships.createdAt,
    })
    .from(friendships)
    .innerJoin(users, eq(users.id, friendships.requesterId))
    .where(and(eq(friendships.addresseeId, meId), eq(friendships.status, "pending")))
    .orderBy(friendships.createdAt)

  res.json({ requests: rows })
})

// POST /friends/request { userId }
router.post("/request", authMiddleware, async (req, res) => {
  const meId = req.user.id
  const { userId } = req.body ?? {}

  if (!userId) return res.status(400).json({ message: "Missing userId" })
  if (userId === meId) return res.status(400).json({ message: "Cannot friend yourself" })

  // l'autre existe ?
  const other = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1)
  if (!other.length) return res.status(404).json({ message: "User not found" })

  // relation existante (2 sens)
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
    if (rel.status === "accepted") return res.status(409).json({ message: "Already friends" })
    if (rel.status === "pending") {
      // auto-accept si l'autre t'a déjà demandé
      if (rel.requesterId === userId) {
        const updated = await db
          .update(friendships)
          .set({ status: "accepted", updatedAt: sql`now()` })
          .where(eq(friendships.id, rel.id))
          .returning()
        return res.json({ status: "accepted", friendship: updated[0] })
      }
      return res.status(409).json({ message: "Request already pending" })
    }
    if (rel.status === "rejected") {
      const updated = await db
        .update(friendships)
        .set({
          requesterId: meId,
          addresseeId: userId,
          status: "pending",
          updatedAt: sql`now()`,
        })
        .where(eq(friendships.id, rel.id))
        .returning()
      return res.json({ status: "pending", friendship: updated[0] })
    }
  }

  const inserted = await db
    .insert(friendships)
    .values({ requesterId: meId, addresseeId: userId, status: "pending" })
    .returning()

  res.status(201).json({ status: "pending", friendship: inserted[0] })
})

// POST /friends/accept { userId }  (userId = celui qui a envoyé)
router.post("/accept", authMiddleware, async (req, res) => {
  const meId = req.user.id
  const { userId } = req.body ?? {}
  if (!userId) return res.status(400).json({ message: "Missing userId" })

  const updated = await db
    .update(friendships)
    .set({ status: "accepted", updatedAt: sql`now()` })
    .where(and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, meId), eq(friendships.status, "pending")))
    .returning()

  if (!updated.length) return res.status(404).json({ message: "No pending request found" })
  res.json({ status: "accepted", friendship: updated[0] })
})

// POST /friends/reject { userId }
router.post("/reject", authMiddleware, async (req, res) => {
  const meId = req.user.id
  const { userId } = req.body ?? {}
  if (!userId) return res.status(400).json({ message: "Missing userId" })

  const updated = await db
    .update(friendships)
    .set({ status: "rejected", updatedAt: sql`now()` })
    .where(and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, meId), eq(friendships.status, "pending")))
    .returning()

  if (!updated.length) return res.status(404).json({ message: "No pending request found" })
  res.json({ status: "rejected", friendship: updated[0] })
})

export default router
