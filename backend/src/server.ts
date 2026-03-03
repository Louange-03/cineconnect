import "dotenv/config"
import express, { type Request, type Response } from "express"
import cors from "cors"
import jwt from "jsonwebtoken"
import { createServer } from "http"
import { Server } from "socket.io"

import { pool } from "./db/client.js"

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

const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_ORIGIN,
    credentials: true,
  },
})

const onlineUsers = new Map<string, Set<string>>()

io.use((socket, next) => {
  const token = socket.handshake.auth?.token

  if (!token) {
    return next(new Error("Unauthorized"))
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string }

    socket.data.user = decoded
    next()
  } catch {
    next(new Error("Unauthorized"))
  }
})

io.on("connection", async (socket) => {
  const userId = socket.data.user?.id as string

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set())
  }

  onlineUsers.get(userId)!.add(socket.id)
  io.emit("user-online", { userId })

  try {
    const conversations = await pool.query(
      `
      SELECT conversation_id 
      FROM conversation_members 
      WHERE user_id = $1
      `,
      [userId]
    )

    conversations.rows.forEach((row) => {
      socket.join(`conversation-${row.conversation_id}`)
    })
  } catch {}

  socket.on("send-message", async ({ conversationId, text }) => {
    try {
      const memberCheck = await pool.query(
        `
        SELECT 1 FROM conversation_members
        WHERE conversation_id = $1 AND user_id = $2
        `,
        [conversationId, userId]
      )

      if (memberCheck.rowCount === 0) return

      const result = await pool.query(
        `
        INSERT INTO messages (conversation_id, sender_id, text)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [conversationId, userId, text]
      )

      const message = result.rows[0]

      io.to(`conversation-${conversationId}`).emit(
        "new-message",
        message
      )
    } catch {}
  })

  socket.on("disconnect", async () => {
    const sockets = onlineUsers.get(userId)
    if (!sockets) return

    sockets.delete(socket.id)

    if (sockets.size === 0) {
      onlineUsers.delete(userId)

      try {
        await pool.query(
          `UPDATE users SET last_seen = NOW() WHERE id = $1`,
          [userId]
        )
      } catch {}

      io.emit("user-offline", { userId })
    }
  })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Server + Socket running on port ${PORT}`)
})