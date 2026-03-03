import express from "express"
import cors from "cors"

import { authRoutes } from "./routes/auth.routes"
import { filmsRoutes } from "./routes/films.routes"
import { usersRoutes } from "./routes/users.routes"
import { reviewsRoutes } from "./routes/reviews.routes"
import { friendsRoutes } from "./routes/friends.routes"
import { messagesRoutes } from "./routes/messages.routes"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/health", (_req, res) => res.json({ ok: true }))

// ✅ API routes
app.use("/api/auth", authRoutes)
app.use("/api/films", filmsRoutes)
app.use("/api/users", usersRoutes)
app.use("/api/reviews", reviewsRoutes)
app.use("/api/friends", friendsRoutes)
app.use("/api/messages", messagesRoutes)

const port = Number(process.env.PORT ?? 3001)
app.listen(port, () => {
  console.log(`✅ API listening on http://localhost:${port}`)
})