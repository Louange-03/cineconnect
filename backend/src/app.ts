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
import { pushRoutes } from "./routes/push.routes"
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
  const extras = (process.env.CORS_EXTRA_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const o = resolveFrontendOrigin()
  let core: string[]
  if (o.includes("localhost") || o.includes("127.0.0.1")) {
    core = [o]
  } else {
    const without8080 = o.replace(/:8080\/?$/, "")
    core = without8080 !== o ? [o, without8080] : [o]
  }
  return [...new Set([...core, ...extras])]
}

/**
 * Application HTTP (sans écoute de port) — utilisée par le serveur et les tests.
 */
export function createApp(): express.Express {
  const app = express()

  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1)
  }

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
  app.use("/api/push", pushRoutes)

  return app
}
