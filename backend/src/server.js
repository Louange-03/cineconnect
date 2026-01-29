import "dotenv/config"
import express from "express"
import cors from "cors"
import { pool } from "./db/client.js"
import authRoutes from "./routes/auth.routes.js"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/health", async (req, res) => {
  try {
    const r = await pool.query("SELECT 1 as ok")
    res.json({ ok: true, db: r.rows[0].ok })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

app.use("/auth", authRoutes)

app.listen(process.env.PORT || 3001, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 3001}`)
})
