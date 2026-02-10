import { Router } from "express"
import { db } from "../db/client.js"
import { friends } from "../db/schema.js"
import { authMiddleware } from "../middlewares/auth.js"
import { eq, and } from "drizzle-orm"

const router = Router()

// Mes amis (acceptés)
router.get("/", authMiddleware, async (req, res) => {
  const rows = await db
    .select()
    .from(friends)
    .where(and(eq(friends.userId, req.user.id), eq(friends.status, "accepted")))

  res.json({ friends: rows })
})

// Demandes reçues
router.get("/requests", authMiddleware, async (req, res) => {
  const rows = await db
    .select()
    .from(friends)
    .where(and(eq(friends.friendId, req.user.id), eq(friends.status, "pending")))

  res.json({ requests: rows })
})

// Envoyer une demande
router.post("/:userId", authMiddleware, async (req, res) => {
  await db.insert(friends).values({
    userId: req.user.id,
    friendId: Number(req.params.userId),
    status: "pending",
  })

  res.status(201).json({ ok: true })
})

// Accepter
router.put("/:userId/accept", authMiddleware, async (req, res) => {
  await db
    .update(friends)
    .set({ status: "accepted" })
    .where(
      and(
        eq(friends.friendId, req.user.id),
        eq(friends.userId, Number(req.params.userId))
      )
    )

  res.json({ ok: true })
})

export default router
