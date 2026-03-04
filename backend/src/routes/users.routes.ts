import { Router, type Request, type Response } from "express"
import { db } from "../db"
import { users } from "../db/schema"
import { authMiddleware } from "../middlewares/auth"
import { ilike, and, sql, eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export const usersRoutes = Router()

// GET /users
usersRoutes.get("/", async (_req, res) => {
  try {
    const list = await db
      .select({ id: users.id, email: users.email, username: users.username, createdAt: users.createdAt })
      .from(users)
      .limit(200)

    res.json({ users: list })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Erreur récupération utilisateurs" })
  }
})

// GET /users/search?q=abc
usersRoutes.get("/search", authMiddleware, async (req: Request, res: Response): Promise<void> => {
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
usersRoutes.patch("/me", authMiddleware, async (req: Request, res: Response): Promise<void> => {
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

  const updated = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, meId))
    .returning({
      id: users.id,
      email: users.email,
      username: users.username,
    })

  res.json({ user: updated[0] })
})

// fallback to provide default export if that's what main code expects (sometimes)
export default usersRoutes
