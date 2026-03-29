import { createServer } from "http"
import { createApp } from "./app"
import { initSocket } from "./socket"
import { pool } from "./db/client"
import { ensurePasswordResetSchema } from "./db/ensurePasswordResetSchema.js"
import { getMailTransportStatus } from "./utils/mailer"

const app = createApp()
const port = Number(process.env.PORT ?? 3007)
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173"

async function start() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL manquant dans l'environnement")
    process.exit(1)
  }

  if (process.env.NODE_ENV === "production") {
    const jwt = process.env.JWT_SECRET?.trim()
    if (!jwt || jwt === "secret") {
      console.error(
        "JWT_SECRET manquant ou non securise en production (definis-le dans Coolify ou verifie SERVICE_BASE64_64_API / domaines web+api dans docker-compose.yaml).",
      )
      process.exit(1)
    }
  }

  await ensurePasswordResetSchema()

  const httpServer = createServer(app)
  initSocket(httpServer, FRONTEND_ORIGIN as string)

  httpServer.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`)
    const mail = getMailTransportStatus()
    if (mail.configured) {
      console.log(
        `[mail] transport configuré (provider=${mail.effectiveProvider}, requested=${mail.requestedProvider}) — les e-mails de réinitialisation seront envoyés.`,
      )
    } else {
      console.log(
        "[mail] aucun transport mail configuré (MAILGUN_*). " +
          "Mot de passe oublié : lien uniquement dans les logs serveur (mode dev).",
      )
    }
  })
}

start().catch((err) => {
  console.error("Impossible de démarrer le serveur:", err)
  pool.end().catch(() => undefined)
  process.exit(1)
})
