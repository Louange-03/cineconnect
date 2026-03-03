import jwt from "jsonwebtoken"
import { pool } from "./db/client.js"
import type { Server } from "socket.io"

export function initSocket(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error("Unauthorized"))

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as { id: string }

      socket.data.userId = decoded.id
      next()
    } catch {
      next(new Error("Unauthorized"))
    }
  })

  io.on("connection", async (socket) => {
    const userId = socket.data.userId

    const conversations = await pool.query(
      `SELECT conversation_id FROM conversation_members WHERE user_id = $1`,
      [userId]
    )

    conversations.rows.forEach((row) => {
      socket.join(`conversation-${row.conversation_id}`)
    })

    socket.on("send-message", async ({ conversationId, text }) => {
      const result = await pool.query(
        `
        INSERT INTO messages (conversation_id, sender_id, text)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [conversationId, userId, text]
      )

      io.to(`conversation-${conversationId}`).emit(
        "new-message",
        result.rows[0]
      )
    })
  })
}