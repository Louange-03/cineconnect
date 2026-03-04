import "dotenv/config"
import express, { type Request, type Response } from "express"
import cors from "cors"
import { createServer } from "http"

import { pool } from "./db/client.js"
import { initSocket } from "./socket.js"

import authRoutes from "./routes/auth.routes.js"
import usersRoutes from "./routes/users.routes.js"
import friendsRoutes from "./routes/friends.routes.js"
import filmsRoutes from "./routes/films.routes.js"
import conversationsRoutes from "./routes/conversations.routes.js"

const app = express()

const FRONTEND_ORIGIN =
  process.env.FRONTEND_URL || "http://localhost:5173"

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
)

app.use(express.json())

app.use("/auth", authRoutes)
app.use("/users", usersRoutes)
app.use("/friends", friendsRoutes)
app.use("/films", filmsRoutes)
app.use("/conversations", conversationsRoutes)

app.get("/health", async (req: Request, res: Response): Promise<void> => {
  try {
    const r = await pool.query("SELECT 1 as ok")
    res.json({ ok: true, db: r.rows[0].ok })
  } catch (e) {
    const error = e as Error
    res.status(500).json({
      ok: false,
      error: error?.message || String(e),
    })
  }
})

app.get("/", (req: Request, res: Response): void => {
  res.json({ ok: true, name: "Cineconnect API" })
})

const httpServer = createServer(app)

initSocket(httpServer, FRONTEND_ORIGIN)

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Server + Socket running on port ${PORT}`)
})