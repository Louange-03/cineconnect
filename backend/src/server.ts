import express from "express"
import cors from "cors"
import { createServer } from "http"
import swaggerUi from "swagger-ui-express"

import { authRoutes } from "./routes/auth.routes"
import { filmsRoutes } from "./routes/films.routes"
import { usersRoutes } from "./routes/users.routes"
import { reviewsRoutes } from "./routes/reviews.routes"
import friendsRoutes from "./routes/friends.routes"
import messagesRoutes from "./routes/messages.routes"
import conversationsRoutes from "./routes/conversations.routes"
import { initSocket } from "./socket"
import openapi from "./swagger"

const app = express()

// En dev : autoriser localhost avec n'importe quel port (Vite peut changer de port)
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"
const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
].filter(Boolean)
const localhostOriginRegex = /^http:\/\/localhost:\d+$/
const corsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (!origin) return callback(null, true)
  if (allowedOrigins.includes(origin) || localhostOriginRegex.test(origin)) {
    return callback(null, true)
  }
  return callback(new Error("Not allowed by CORS"))
}
app.use(cors({ origin: corsOrigin, credentials: true }))
app.use(express.json())

app.get("/health", (_req, res) => res.json({ ok: true }))

// Swagger UI – documentation de l'API
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi))

// Optionally respond to the root URL for people checking if the API is up
app.get("/", (_req, res) => {
  res.json({ ok: true, name: "Cineconnect API is running" })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/films", filmsRoutes)
app.use("/api/users", usersRoutes)
app.use("/api/reviews", reviewsRoutes)
app.use("/api/friends", friendsRoutes)
app.use("/api/messages", messagesRoutes)
app.use("/api/conversations", conversationsRoutes)

const port = Number(process.env.PORT ?? 3001)
const httpServer = createServer(app)

initSocket(httpServer, [...allowedOrigins, localhostOriginRegex])

httpServer.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
  console.log(`Swagger docs available at http://localhost:${port}/api/docs`)
})