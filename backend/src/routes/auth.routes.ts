import { Router, Request } from "express"
import bcrypt from "bcryptjs"
import { db } from "../db"
import { users, passwordResetTokens } from "../db/schema"
import { and, eq, gt, isNull, sql } from "drizzle-orm"
import { signToken, verifyToken } from "../utils/tokens.js"
import { createPasswordResetToken, hashPasswordResetToken } from "../utils/passwordReset.js"
import { isSmtpFullyConfigured, sendPasswordResetEmail } from "../utils/mailer.js"

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

authRoutes.post("/forgot-password", async (req, res) => {
  try {
    const rawEmail = req.body?.email
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : ""

    if (!email) {
      return res.status(400).json({ message: "Email invalide" })
    }

    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    // Avoid account enumeration: always return success.
    if (!user[0]) {
      return res.json({
        message: "Si votre compte existe, vous recevrez un email avec un lien de réinitialisation.",
      })
    }

    const ttlMinutes = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? "30")
    const { rawToken, tokenHash } = createPasswordResetToken()
    const expiresAt = new Date(Date.now() + Math.max(1, ttlMinutes) * 60_000)

    await db
      .delete(passwordResetTokens)
      .where(and(eq(passwordResetTokens.userId, user[0].id), isNull(passwordResetTokens.usedAt)))

    const inserted = await db
      .insert(passwordResetTokens)
      .values({
        userId: user[0].id,
        tokenHash,
        expiresAt,
      })
      .returning({ id: passwordResetTokens.id })

    const resetRowId = inserted[0]?.id
    if (!resetRowId) {
      console.error("[auth] forgot-password: insert sans id retourné")
      return res.status(500).json({ message: "Erreur technique, réessayez plus tard." })
    }

    const frontendUrlRaw = process.env.FRONTEND_URL || "http://localhost:5173"
    const frontendUrl = frontendUrlRaw.replace(/\/$/, "")
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`

    try {
      await sendPasswordResetEmail({
        to: email,
        resetUrl,
      })
    } catch (mailErr) {
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, resetRowId))
      console.error("[auth] forgot-password: envoi email", mailErr)
      return res.status(503).json({
        message:
          "Impossible d'envoyer l'email pour le moment. Vérifiez la configuration SMTP ou réessayez plus tard.",
      })
    }

    const payload: { message: string; resetUrl?: string } = {
      message: "Si votre compte existe, vous recevrez un email avec un lien de réinitialisation.",
    }
    if (process.env.PASSWORD_RESET_DEV_RETURN_LINK === "true" && !isSmtpFullyConfigured()) {
      payload.resetUrl = resetUrl
    }
    res.json(payload)
  } catch (err) {
    console.error("[auth] forgot-password", err)
    res.status(500).json({ message: "Erreur demande reset password" })
  }
})

authRoutes.post("/reset-password", async (req, res) => {
  try {
    const rawToken = req.body?.token
    const rawPassword = req.body?.password

    const token = typeof rawToken === "string" ? rawToken.trim() : ""
    const password = typeof rawPassword === "string" ? rawPassword : ""

    if (!token || !password) {
      return res.status(400).json({ message: "Données invalides" })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit faire au moins 6 caractères" })
    }

    const tokenHash = hashPasswordResetToken(token)
    const now = new Date()

    const tokenRows = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          sql`${passwordResetTokens.usedAt} IS NULL`,
          gt(passwordResetTokens.expiresAt, now),
        ),
      )
      .limit(1)

    const tokenRow = tokenRows[0]
    if (!tokenRow) {
      return res.status(400).json({ message: "Token invalide ou expiré" })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await db.update(users).set({ passwordHash }).where(eq(users.id, tokenRow.userId))
    await db
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(eq(passwordResetTokens.id, tokenRow.id))

    res.json({ message: "Mot de passe mis à jour avec succès." })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Erreur réinitialisation" })
  }
})