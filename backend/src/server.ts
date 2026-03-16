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

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "*"
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }))
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

initSocket(httpServer, FRONTEND_ORIGIN as string)

httpServer.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
  console.log(`Swagger docs available at http://localhost:${port}/api/docs`)
})