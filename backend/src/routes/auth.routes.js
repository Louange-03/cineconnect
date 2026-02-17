import { Router } from "express"
import bcrypt from "bcrypt"
import { z } from "zod"
import { eq } from "drizzle-orm"

import { db } from "../db/client.js"
import { users } from "../db/schema.js"
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens.js"
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
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        role: users.role,
        tokenVersion: users.tokenVersion,
      })

    const user = inserted[0]
    const accessToken = signAccessToken(user)
    const refreshToken = signRefreshToken(user)

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/auth/refresh",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    })

    return res.status(201).json({ token: accessToken, user })
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

  const found = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  const user = found[0]
  if (!user) return res.status(401).json({ message: "Identifiants incorrects" })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ message: "Identifiants incorrects" })

  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    tokenVersion: user.tokenVersion,
  }

  const accessToken = signAccessToken(safeUser)
  const refreshToken = signRefreshToken(safeUser)

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/auth/refresh",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  })

  return res.json({ token: accessToken, user: safeUser })
})

router.post("/refresh", async (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) return res.status(401).json({ message: "Non autorisé" })

  try {
    const payload = verifyRefreshToken(token)

    const found = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        role: users.role,
        tokenVersion: users.tokenVersion,
      })
      .from(users)
      .where(eq(users.id, payload.id))
      .limit(1)

    const user = found[0]
    if (!user) return res.status(401).json({ message: "Non autorisé" })
    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: "Non autorisé" })
    }

    const accessToken = signAccessToken(user)
    const refreshToken = signRefreshToken(user)

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/auth/refresh",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    })

    return res.json({ token: accessToken, user })
  } catch {
    return res.status(401).json({ message: "Non autorisé" })
  }
})

router.post("/logout", authMiddleware, async (req, res) => {
  await db
    .update(users)
    .set({ tokenVersion: req.user.tokenVersion + 1 })
    .where(eq(users.id, req.user.id))

  res.clearCookie("refreshToken", { path: "/auth/refresh" })
  return res.json({ ok: true })
})

router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user })
})

export default router
