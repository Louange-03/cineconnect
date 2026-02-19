import { Router, type Request, type Response } from "express"
import { db } from "../db/client.js"
import { users } from "../db/schema.js"
import { authMiddleware } from "../middlewares/auth.js"
import { ilike, and, sql } from "drizzle-orm"

const router = Router()

// GET /users?limit=20
router.get("/", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const meId = req.user!.id
  const limitParam = req.query.limit as string | undefined
  const limit = Math.min(parseInt(limitParam ?? "50", 10) || 50, 100)

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
router.get("/search", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const meId = req.user!.id
  const q = (req.query.q ?? "").toString().trim()
  
  if (!q) {
    res.json({ users: [] })
    return
  }

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
//