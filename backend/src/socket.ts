import { Server } from "socket.io"
import { Server as HttpServer } from "http"
import jwt from "jsonwebtoken"
import { pool } from "./db/client.js"

const onlineUsers = new Map<string, Set<string>>()

export const initSocket = (
  httpServer: HttpServer,
  frontendOrigin: string | string[],
) => {
  const io = new Server(httpServer, {
    cors: {
      origin: frontendOrigin,
      credentials: true,
    },
  })

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

      conversations.rows.forEach((row: { conversation_id: string }) => {
        socket.join(`conversation-${row.conversation_id}`)
      })
    } catch (e) {
      console.error(e)
    }

    socket.on("send-message", async ({ conversationId, text }) => {
      try {
        const memberCheck = await pool.query(
          `
          SELECT 1 FROM conversation_members
          WHERE conversation_id = $1 AND user_id = $2
          `,
          [conversationId, userId]
        )

        if (!memberCheck.rowCount) return

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
      } catch (e) {
        console.error(e)
      }
    })

    socket.on("typing", async ({ conversationId }: { conversationId: string }) => {
      if (!conversationId) return
      try {
        const memberCheck = await pool.query(
          `
          SELECT 1 FROM conversation_members
          WHERE conversation_id = $1 AND user_id = $2
          `,
          [conversationId, userId]
        )
        if (!memberCheck.rowCount) return
        socket.to(`conversation-${conversationId}`).emit("user-typing", { userId })
      } catch (e) {
        console.error(e)
      }
    })

    socket.on("stop-typing", async ({ conversationId }: { conversationId: string }) => {
      if (!conversationId) return
      try {
        const memberCheck = await pool.query(
          `
          SELECT 1 FROM conversation_members
          WHERE conversation_id = $1 AND user_id = $2
          `,
          [conversationId, userId]
        )
        if (!memberCheck.rowCount) return
        socket.to(`conversation-${conversationId}`).emit("user-stop-typing", { userId })
      } catch (e) {
        console.error(e)
      }
    })

    socket.on("mark-as-seen", async ({ conversationId }: { conversationId: string }) => {
      if (!conversationId) return
      try {
        const memberCheck = await pool.query(
          `
          SELECT 1 FROM conversation_members
          WHERE conversation_id = $1 AND user_id = $2
          `,
          [conversationId, userId]
        )
        if (!memberCheck.rowCount) return

        await pool.query(
          `
          UPDATE messages
          SET seen = true
          WHERE conversation_id = $1
            AND sender_id <> $2
            AND seen = false
          `,
          [conversationId, userId]
        )

        io.to(`conversation-${conversationId}`).emit("messages-seen", {
          conversationId,
          seenBy: userId,
        })
      } catch (e) {
        console.error(e)
      }
    })

    socket.on(
      "message-reaction",
      async ({
        conversationId,
        messageId,
        emoji,
      }: {
        conversationId: string
        messageId: string
        emoji: string
      }) => {
        if (!conversationId || !messageId || !emoji) return
        try {
          const memberCheck = await pool.query(
            `
            SELECT 1 FROM conversation_members
            WHERE conversation_id = $1 AND user_id = $2
            `,
            [conversationId, userId]
          )
          if (!memberCheck.rowCount) return

          const msgCheck = await pool.query(
            `
            SELECT 1 FROM messages
            WHERE id = $1 AND conversation_id = $2
            `,
            [messageId, conversationId]
          )
          if (!msgCheck.rowCount) return

          io.to(`conversation-${conversationId}`).emit("message-reaction", {
            conversationId,
            messageId,
            emoji,
            userId,
          })
        } catch (e) {
          console.error(e)
        }
      }
    )

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
        } catch (e) {
          console.error(e)
        }

        io.emit("user-offline", { userId })
      }
    })
  })

  return io
}