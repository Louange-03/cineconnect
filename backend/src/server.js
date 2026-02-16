import "dotenv/config"
import express from "express"
import cors from "cors"
import { pool } from "./db/client.js"

import authRoutes from "./routes/auth.routes.js"
import usersRoutes from "./routes/users.routes.js"

const app = express()

app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json())

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
