import "dotenv/config"
import nodemailer from "nodemailer"

/** Exported for forgot-password (optional dev response link). */
export function isSmtpFullyConfigured(): boolean {
  return isSmtpConfigured() !== null
}

function isSmtpConfigured(): {
  host: string
  port: number
  user: string
  pass: string
  from: string
} | null {
  const host = (process.env.SMTP_HOST ?? "").trim()
  const portRaw = (process.env.SMTP_PORT ?? "").trim()
  const user = (process.env.SMTP_USER ?? "").trim()
  const pass = (process.env.SMTP_PASS ?? "").trim()
  const from = (process.env.MAIL_FROM ?? user).trim()

  const port = Number(portRaw)
  if (!host || !portRaw || !Number.isFinite(port) || port <= 0 || !user || !pass || !from) {
    return null
  }

  return { host, port, user, pass, from }
}

export async function sendPasswordResetEmail(params: { to: string; resetUrl: string }): Promise<void> {
  const { to, resetUrl } = params
  const subject = process.env.PASSWORD_RESET_EMAIL_SUBJECT ?? "Réinitialisation du mot de passe"

  const smtp = isSmtpConfigured()
  if (!smtp) {
    console.log(
      `[mail][password-reset] SMTP incomplet ou absent — lien de réinitialisation (mode dev) :\n` +
        `to: ${to}\nresetUrl: ${resetUrl}`
    )
    return
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.pass },
  })

  const text = [
    `Bonjour,`,
    ``,
    `Vous avez demandé la réinitialisation de votre mot de passe.`,
    `Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :`,
    ``,
    resetUrl,
    ``,
    `Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
  ].join("\n")

  try {
    await transporter.sendMail({
      from: smtp.from,
      to,
      subject,
      text,
    })
  } catch (e) {
    const msg = (e as Error)?.message ?? String(e)
    throw new Error(`Échec envoi email (SMTP): ${msg}`)
  }
}
