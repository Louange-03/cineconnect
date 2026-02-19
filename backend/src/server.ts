import "dotenv/config"
import express, { type Request, type Response } from "express"
import cors from "cors"
import { pool } from "./db/client.js"

import authRoutes from "./routes/auth.routes.js"
import usersRoutes from "./routes/users.routes.js"
import friendsRoutes from "./routes/friends.routes.js"
import filmsRoutes from "./routes/films.routes.js"

const app = express()

// allow the frontend origin from env, default to localhost:5173
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173"
app.use(cors({ origin: FRONTEND_ORIGIN }))
app.use(express.json())

// ✅ Healthcheck DB
app.get("/health", async (req: Request, res: Response): Promise<void> => {
  try {
    const r = await pool.query("SELECT 1 as ok")
    res.json({ ok: true, db: r.rows[0].ok })
  } catch (e) {
    console.error("HEALTH ERROR:", e)
    const error = e as Error
    res.status(500).json({
      ok: false,
      error: error?.message || String(e),
    })
  }
})

// ✅ Routes API
app.use("/auth", authRoutes)
app.use("/users", usersRoutes)
app.use("/friends", friendsRoutes)
app.use("/films", filmsRoutes)

// Optionnel: racine
app.get("/", (req: Request, res: Response): void => {
  res.json({ ok: true, name: "Cineconnect API" })
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`)
})
