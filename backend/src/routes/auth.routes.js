import { Router } from "express"
import bcrypt from "bcrypt"
import { z } from "zod"
import { eq } from "drizzle-orm"

import { db } from "../db/client.js"
import { users } from "../db/schema.js"
import { signToken } from "../utils/tokens.js"
import { authMiddleware } from "../middlewares/auth.js"

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(6).max(72),
})

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: "Données invalides",
      errors: parsed.error.issues,
    })
  }

  const { email, username, password } = parsed.data
  const passwordHash = await bcrypt.hash(password, 10)

  try {
    const inserted = await db
      .insert(users)
      .values({ email, username, passwordHash })
      .returning({ id: users.id, email: users.email, username: users.username })

    const user = inserted[0]
    const token = signToken(user)

    return res.status(201).json({ token, user })
  } catch {
    return res.status(400).json({ message: "Email ou username déjà utilisé" })
  }
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: "Données invalides",
      errors: parsed.error.issues,
    })
  }

  const { email, password } = parsed.data

  const found = await db.select().from(users).where(eq(users.email, email)).limit(1)
  const user = found[0]
  if (!user) return res.status(401).json({ message: "Identifiants incorrects" })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ message: "Identifiants incorrects" })

  const safeUser = { id: user.id, email: user.email, username: user.username }
  const token = signToken(safeUser)

  return res.json({ token, user: safeUser })
})

router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user })
})

export default router
