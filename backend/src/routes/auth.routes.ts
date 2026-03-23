import { Router, Request } from "express"
import bcrypt from "bcryptjs"
import { db } from "../db"
import { users } from "../db/schema"
import { eq } from "drizzle-orm"
import { signToken, verifyToken } from "../utils/tokens.js"

export const authRoutes = Router()

function getBearerToken(req: Request): string | null {
  const h = req.headers?.authorization
  if (!h || typeof h !== "string") return null
  const [type, token] = h.split(" ")
  if (type !== "Bearer" || !token) return null
  return token
}

authRoutes.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body ?? {}
    if (!email || !username || !password) {
      return res.status(400).json({ message: "email, username, password requis" })
    }

    const passwordHash = await bcrypt.hash(String(password), 10)

    const created = await db
      .insert(users)
      .values({
        email: String(email).toLowerCase(),
        username: String(username),
        passwordHash,
      })
      .returning({ id: users.id, email: users.email, username: users.username })

    const user = created[0]
    const token = signToken(user)

    res.json({ token, user })
  } catch (err: unknown) {
    const error = err as Error
    const msg = String(error?.message || err)
    if (msg.toLowerCase().includes("unique")) {
      return res.status(409).json({ message: "Email ou username déjà utilisé" })
    }
    console.error(err)
    res.status(500).json({ message: "Erreur inscription" })
  }
})

authRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {}
    if (!email || !password) {
      return res.status(400).json({ message: "email et password requis" })
    }

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, String(email).toLowerCase()))
      .limit(1)

    const user = rows[0]
    if (!user) return res.status(401).json({ message: "Identifiants invalides" })

    const ok = await bcrypt.compare(String(password), user.passwordHash)
    if (!ok) return res.status(401).json({ message: "Identifiants invalides" })

    const token = signToken({ id: user.id, email: user.email, username: user.username })

    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Erreur connexion" })
  }
})

authRoutes.get("/me", async (req, res) => {
  try {
    const token = getBearerToken(req)
    if (!token) return res.status(401).json({ message: "Non authentifié" })

    const decoded = verifyToken(token)

    const rows = await db
      .select({ id: users.id, email: users.email, username: users.username })
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1)

    const me = rows[0]
    if (!me) return res.status(404).json({ message: "Utilisateur introuvable" })

    res.json({ user: me })
  } catch {
    res.status(401).json({ message: "Token invalide" })
  }
})