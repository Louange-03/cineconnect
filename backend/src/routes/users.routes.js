import { Router } from "express"
import { db } from "../db/client.js"
import { users } from "../db/schema.js"
import { authMiddleware } from "../middlewares/auth.js"
import { ilike, and, sql } from "drizzle-orm"

const router = Router()

// GET /users?limit=20
router.get("/", authMiddleware, async (req, res) => {
  const meId = req.user.id
  const limit = Math.min(parseInt(req.query.limit ?? "50", 10) || 50, 100)

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(sql`${users.id} <> ${meId}`)
    .limit(limit)

  res.json({ users: rows })
})

// GET /users/search?q=abc
router.get("/search", authMiddleware, async (req, res) => {
  const meId = req.user.id
  const q = (req.query.q ?? "").toString().trim()
  if (!q) return res.json({ users: [] })

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(sql`${users.id} <> ${meId}`, ilike(users.username, `%${q}%`)))
    .limit(50)

  res.json({ users: rows })
})

export default router
