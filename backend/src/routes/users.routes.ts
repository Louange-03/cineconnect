import { Router, type Request, type Response } from "express"
import { db } from "../db/client.js"
import { users } from "../db/schema.js"
import { authMiddleware } from "../middlewares/auth.js"
import { ilike, and, sql, eq } from "drizzle-orm"
import bcrypt from "bcrypt"

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

// PATCH /users/me -> modifier email et mot de passe
router.patch("/me", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const meId = req.user!.id
  const { email, password } = req.body ?? {}

  if (!email && !password) {
    res.status(400).json({ message: "Rien à mettre à jour" })
    return
  }

  const updates: Partial<{ email: string; passwordHash: string }> = {}

  if (email) {
    const trimmed = email.toString().trim()
    if (!trimmed.includes("@")) {
      res.status(400).json({ message: "Email invalide" })
      return
    }
    updates.email = trimmed
  }

  if (password) {
    if (password.length < 6) {
      res.status(400).json({ message: "Le mot de passe doit faire au moins 6 caractères" })
      return
    }
    updates.passwordHash = await bcrypt.hash(password, 10)
  }

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, meId))
    .returning({
      id: users.id,
      email: users.email,
      username: users.username,
    })

  res.json({ user: updated })
})

export default router