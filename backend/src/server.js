import "dotenv/config"
import express from "express"
import cors from "cors"
import pg from "pg"

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

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

app.listen(process.env.PORT || 4000, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 4000}`)
})
