import "dotenv/config"
import express from "express"
import cors from "cors"

import authRoutes from "./routes/auth.routes.js"

const app = express()

app.use(cors())
app.use(express.json())

// 🔹 ROUTES
app.use("/auth", authRoutes)

// 🔹 TEST
app.get("/health", (req, res) => {
  res.json({ ok: true })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})
