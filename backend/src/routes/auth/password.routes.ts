import { Router } from "express"
import bcrypt from "bcryptjs"
import { db } from "../../db"
import { users, passwordResetTokens } from "../../db/schema"
import { and, eq, gt, isNull, sql } from "drizzle-orm"
import { createPasswordResetToken, hashPasswordResetToken } from "../../utils/passwordReset.js"
import { isSmtpFullyConfigured, sendPasswordResetEmail } from "../../utils/mailer.js"

export const passwordAuthRoutes = Router()

passwordAuthRoutes.post("/forgot-password", async (req, res) => {
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

    if (!user[0]) {
      return res.json({
        message: "Si votre compte existe, vous recevrez un email avec un lien de réinitialisation.",
      })
    }

    const devReturnLink = process.env.PASSWORD_RESET_DEV_RETURN_LINK === "true"
    const smtpReady = isSmtpFullyConfigured()
    if (!smtpReady && !devReturnLink) {
      return res.status(503).json({
        message:
          "Réinitialisation indisponible: SMTP non configuré. Contactez l'administrateur ou activez le mode dev local.",
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
          "Impossible d'envoyer l'email pour le moment. Vérifiez la configuration Mailgun ou réessayez plus tard.",
      })
    }

    const payload: { message: string; resetUrl?: string } = {
      message: "Si votre compte existe, vous recevrez un email avec un lien de réinitialisation.",
    }
    if (devReturnLink && !smtpReady) {
      payload.resetUrl = resetUrl
    }
    res.json(payload)
  } catch (err) {
    console.error("[auth] forgot-password", err)
    res.status(500).json({ message: "Erreur demande reset password" })
  }
})

passwordAuthRoutes.post("/reset-password", async (req, res) => {
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
