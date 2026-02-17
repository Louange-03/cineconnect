import "dotenv/config"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import cookieParser from "cookie-parser"
import { pool } from "./db/client.js"

import authRoutes from "./routes/auth.routes.js"
import usersRoutes from "./routes/users.routes.js"

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json())

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
)

// ✅ Healthcheck DB
app.get("/health", async (req, res) => {
  try {
    const r = await pool.query("SELECT 1 as ok")
    res.json({ ok: true, db: r.rows[0].ok })
  } catch (e) {
    console.error("HEALTH ERROR:", e)
    res.status(500).json({
      ok: false,
      error: e?.message || String(e),
    })
  }
})

// ✅ Routes API
app.use("/auth", authRoutes)
app.use("/users", usersRoutes)

// Optionnel: racine
app.get("/", (req, res) => {
  res.json({ ok: true, name: "Cineconnect API" })
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`)
})
