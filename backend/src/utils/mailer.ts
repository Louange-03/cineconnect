import nodemailer from "nodemailer"

/** Exported for forgot-password (optional dev response link). */
export function isSmtpFullyConfigured(): boolean {
  return isMailTransportConfigured()
}

export function getMailTransportStatus(): {
  requestedProvider: "auto" | "mailgun" | "smtp"
  effectiveProvider: "mailgun" | "smtp" | "none"
  configured: boolean
} {
  const requestedProvider = getMailProvider()
  const mailgun = getMailgunConfig() !== null
  const smtp = isSmtpConfigured() !== null

  if (requestedProvider === "mailgun") {
    if (mailgun) return { requestedProvider, effectiveProvider: "mailgun", configured: true }
    if (smtp) return { requestedProvider, effectiveProvider: "smtp", configured: true }
    return { requestedProvider, effectiveProvider: "none", configured: false }
  }
  if (requestedProvider === "smtp") {
    if (smtp) return { requestedProvider, effectiveProvider: "smtp", configured: true }
    if (mailgun) return { requestedProvider, effectiveProvider: "mailgun", configured: true }
    return { requestedProvider, effectiveProvider: "none", configured: false }
  }
  // auto
  if (mailgun) return { requestedProvider, effectiveProvider: "mailgun", configured: true }
  if (smtp) return { requestedProvider, effectiveProvider: "smtp", configured: true }
  return { requestedProvider, effectiveProvider: "none", configured: false }
}

function isMailTransportConfigured(): boolean {
  return getMailTransportStatus().configured
}

function getMailProvider(): "auto" | "mailgun" | "smtp" {
  const raw = (process.env.MAIL_PROVIDER ?? "auto").trim().toLowerCase()
  if (raw === "mailgun") return "mailgun"
  if (raw === "smtp") return "smtp"
  return "auto"
}

function getMailgunConfig(): { apiKey: string; domain: string } | null {
  const apiKey = (process.env.MAILGUN_API_KEY ?? "").trim()
  const domain = (process.env.MAILGUN_DOMAIN ?? "").trim()
  if (!apiKey || !domain) return null
  return { apiKey, domain }
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
  // Mots de passe Gmail « application » : souvent collés avec des espaces — les retirer.
  const pass = (process.env.SMTP_PASS ?? "").replace(/\s+/g, "").trim()
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
  const fromFallback = (process.env.MAIL_FROM ?? "").trim()
  const provider = getMailProvider()

  const mailgun = getMailgunConfig()
  if (provider !== "smtp" && mailgun) {
    const { apiKey, domain } = mailgun
    const baseUrl = (process.env.MAILGUN_BASE_URL ?? "https://api.mailgun.net").trim()
    const from = ((process.env.MAILGUN_FROM ?? "").trim() || fromFallback)

    if (!from) {
      throw new Error("MAILGUN_FROM (ou MAIL_FROM) manquant pour l'envoi Mailgun")
    }

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

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.5;">
        <h2 style="margin: 0 0 12px;">Reinitialisation de votre mot de passe</h2>
        <p style="margin: 0 0 12px;">Bonjour,</p>
        <p style="margin: 0 0 12px;">
          Vous avez demande la reinitialisation de votre mot de passe CineConnect.
        </p>
        <p style="margin: 0 0 18px;">
          Cliquez sur le bouton ci-dessous pour definir un nouveau mot de passe:
        </p>
        <p style="margin: 0 0 18px;">
          <a
            href="${resetUrl}"
            style="
              display:inline-block;
              background:#1d4ed8;
              color:#ffffff;
              text-decoration:none;
              padding:10px 16px;
              border-radius:8px;
              font-weight:600;
            "
          >
            Reinitialiser mon mot de passe
          </a>
        </p>
        <p style="margin: 0 0 8px;">
          Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur:
        </p>
        <p style="word-break: break-all; margin: 0 0 18px; color:#1d4ed8;">${resetUrl}</p>
        <p style="margin: 0; color: #6b7280; font-size: 13px;">
          Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet email.
        </p>
      </div>
    `

    const body = new URLSearchParams()
    body.set("from", from)
    body.set("to", to)
    body.set("subject", subject)
    body.set("text", text)
    body.set("html", html)

    const encoded = Buffer.from(`api:${apiKey}`).toString("base64")
    const response = await fetch(`${baseUrl}/v3/${domain}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    })

    if (!response.ok) {
      const details = await response.text().catch(() => "")
      throw new Error(`Échec envoi email (Mailgun): ${response.status} ${details}`.trim())
    }
    return
  }

  const smtp = isSmtpConfigured()
  if (!smtp) {
    const provider = getMailProvider()
    console.log(
      `[mail][password-reset] transport mail non configuré (provider=${provider}) — lien de réinitialisation (mode dev) :\n` +
        `to: ${to}\nresetUrl: ${resetUrl}`
    )
    return
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    requireTLS: smtp.port === 587,
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

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Reinitialisation de votre mot de passe</h2>
      <p style="margin: 0 0 12px;">Bonjour,</p>
      <p style="margin: 0 0 12px;">
        Vous avez demande la reinitialisation de votre mot de passe CineConnect.
      </p>
      <p style="margin: 0 0 18px;">
        Cliquez sur le bouton ci-dessous pour definir un nouveau mot de passe:
      </p>
      <p style="margin: 0 0 18px;">
        <a
          href="${resetUrl}"
          style="
            display:inline-block;
            background:#1d4ed8;
            color:#ffffff;
            text-decoration:none;
            padding:10px 16px;
            border-radius:8px;
            font-weight:600;
          "
        >
          Reinitialiser mon mot de passe
        </a>
      </p>
      <p style="margin: 0 0 8px;">
        Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur:
      </p>
      <p style="word-break: break-all; margin: 0 0 18px; color:#1d4ed8;">${resetUrl}</p>
      <p style="margin: 0; color: #6b7280; font-size: 13px;">
        Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet email.
      </p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: smtp.from,
      to,
      subject,
      text,
      html,
    })
  } catch (e) {
    const msg = (e as Error)?.message ?? String(e)
    throw new Error(`Échec envoi email (SMTP): ${msg}`)
  }
}

export async function sendNewMessageEmail(params: {
  to: string
  recipientName?: string | null
  senderName: string
  previewText: string
  conversationUrl?: string
}): Promise<void> {
  const { to, recipientName, senderName, previewText, conversationUrl } = params
  const subject = process.env.NEW_MESSAGE_EMAIL_SUBJECT ?? "Nouveau message sur CineConnect"
  const fromFallback = (process.env.MAIL_FROM ?? "").trim()
  const provider = getMailProvider()
  const safePreview = previewText.length > 180 ? `${previewText.slice(0, 177)}...` : previewText
  const helloName = (recipientName ?? "").trim() || "Bonjour"

  if (!safePreview.trim()) return

  const text = [
    `${helloName},`,
    "",
    `${senderName} vous a envoyé un nouveau message sur CineConnect.`,
    "",
    `Aperçu : ${safePreview}`,
    conversationUrl ? `Ouvrir la discussion : ${conversationUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Nouveau message</h2>
      <p style="margin: 0 0 12px;">${helloName},</p>
      <p style="margin: 0 0 12px;">
        <strong>${senderName}</strong> vous a envoye un nouveau message sur CineConnect.
      </p>
      <p style="margin: 0 0 12px; padding: 10px 12px; border-radius: 8px; background: #f3f4f6;">
        ${safePreview.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
      </p>
      ${
        conversationUrl
          ? `<p style="margin: 0 0 12px;"><a href="${conversationUrl}" style="color:#1d4ed8;">Ouvrir la discussion</a></p>`
          : ""
      }
    </div>
  `

  const mailgun = getMailgunConfig()
  if (provider !== "smtp" && mailgun) {
    const { apiKey, domain } = mailgun
    const baseUrl = (process.env.MAILGUN_BASE_URL ?? "https://api.mailgun.net").trim()
    const from = ((process.env.MAILGUN_FROM ?? "").trim() || fromFallback)
    if (!from) throw new Error("MAILGUN_FROM (ou MAIL_FROM) manquant pour l'envoi Mailgun")

    const body = new URLSearchParams()
    body.set("from", from)
    body.set("to", to)
    body.set("subject", subject)
    body.set("text", text)
    body.set("html", html)

    const encoded = Buffer.from(`api:${apiKey}`).toString("base64")
    const response = await fetch(`${baseUrl}/v3/${domain}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    })
    if (!response.ok) {
      const details = await response.text().catch(() => "")
      throw new Error(`Échec envoi email (Mailgun): ${response.status} ${details}`.trim())
    }
    return
  }

  const smtp = isSmtpConfigured()
  if (!smtp) {
    console.log(`[mail][new-message] transport mail non configuré. to=${to}, sender=${senderName}`)
    return
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    requireTLS: smtp.port === 587,
    auth: { user: smtp.user, pass: smtp.pass },
  })

  try {
    await transporter.sendMail({
      from: smtp.from,
      to,
      subject,
      text,
      html,
    })
  } catch (e) {
    const msg = (e as Error)?.message ?? String(e)
    throw new Error(`Échec envoi email (SMTP): ${msg}`)
  }
}
