import { createServer } from "http"
import { createApp } from "./app"
import { initSocket } from "./socket"
import { pool } from "./db/client"
import { ensurePasswordResetSchema } from "./db/ensurePasswordResetSchema.js"
import { isSmtpFullyConfigured } from "./utils/mailer"

const app = createApp()
const port = Number(process.env.PORT ?? 3007)
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173"

async function start() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL manquant dans l'environnement")
    process.exit(1)
  }

  await ensurePasswordResetSchema()

  const httpServer = createServer(app)
  initSocket(httpServer, FRONTEND_ORIGIN as string)

  httpServer.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`)
    if (isSmtpFullyConfigured()) {
      console.log("[mail] SMTP configuré — les e-mails de réinitialisation de mot de passe seront envoyés.")
    } else {
      console.log(
        "[mail] SMTP non configuré (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM). " +
          "Mot de passe oublié : lien uniquement dans les logs serveur.",
      )
    }
  })
}

start().catch((err) => {
  console.error("Impossible de démarrer le serveur:", err)
  pool.end().catch(() => undefined)
  process.exit(1)
})
