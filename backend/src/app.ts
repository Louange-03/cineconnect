import express from "express"
import cors from "cors"
import swaggerUi from "swagger-ui-express"

import { authRoutes } from "./routes/auth.routes"
import { filmsRoutes } from "./routes/films.routes"
import { usersRoutes } from "./routes/users.routes"
import { reviewsRoutes } from "./routes/reviews.routes"
import friendsRoutes from "./routes/friends.routes"
import messagesRoutes from "./routes/messages.routes"
import conversationsRoutes from "./routes/conversations.routes"
import { openApiDocument } from "./swagger"

const DEFAULT_FRONTEND_ORIGIN = "http://localhost:5173"

/** Origine CORS (extraite pour tests et couverture des branches). */
export function resolveFrontendOrigin(): string {
  const raw = process.env.FRONTEND_URL
  if (raw != null && String(raw).trim() !== "") {
    return String(raw).trim()
  }
  return DEFAULT_FRONTEND_ORIGIN
}

/**
 * Coolify indique souvent le port conteneur 8080 dans l’URL (ex. …sslip.io:8080) ;
 * le navigateur accede au site via le proxy en :80 / :443 sans ce suffixe.
 * On autorise les deux formes pour CORS (sauf localhost ou 127.0.0.1).
 */
export function resolveAllowedFrontendOrigins(): string[] {
  const o = resolveFrontendOrigin()
  if (o.includes("localhost") || o.includes("127.0.0.1")) return [o]
  const without8080 = o.replace(/:8080\/?$/, "")
  return without8080 !== o ? [o, without8080] : [o]
}

/**
 * Application HTTP (sans écoute de port) — utilisée par le serveur et les tests.
 */
export function createApp(): express.Express {
  const app = express()

  app.use(
    cors({ origin: resolveAllowedFrontendOrigins(), credentials: true }),
  )
  app.use(express.json())

  app.get("/health", (_req, res) => res.json({ ok: true }))
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument))
  app.get("/api/docs-json", (_req, res) => res.json(openApiDocument))

  app.get("/", (_req, res) => {
    res.json({ ok: true, name: "Cineconnect API is running" })
  })

  app.use("/api/auth", authRoutes)
  app.use("/api/films", filmsRoutes)
  app.use("/api/users", usersRoutes)
  app.use("/api/reviews", reviewsRoutes)
  app.use("/api/friends", friendsRoutes)
  app.use("/api/messages", messagesRoutes)
  app.use("/api/conversations", conversationsRoutes)

  return app
}
