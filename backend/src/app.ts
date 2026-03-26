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
 * Application HTTP (sans écoute de port) — utilisée par le serveur et les tests.
 */
export function createApp(): express.Express {
  const app = express()

  const FRONTEND_ORIGIN = resolveFrontendOrigin()
  app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }))
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
