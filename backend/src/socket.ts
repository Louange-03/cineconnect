import { Server } from "socket.io"
import { Server as HttpServer } from "http"
import jwt from "jsonwebtoken"
import { pool } from "./db/client.js"
import { sendNewMessageEmail } from "./utils/mailer"
import { sendWebPushNotification } from "./utils/push"

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

    socket.on(
      "send-message",
      async ({
        conversationId,
        text,
        replyToMessageId,
      }: {
        conversationId: string
        text: string
        replyToMessageId?: string | null
      }) => {
      try {
        const memberCheck = await pool.query(
          `
          SELECT 1 FROM conversation_members
          WHERE conversation_id = $1 AND user_id = $2
          `,
          [conversationId, userId]
        )

        if (!memberCheck.rowCount) return
        socket.join(`conversation-${conversationId}`)

        let replyToId: string | null = null
        if (replyToMessageId && typeof replyToMessageId === "string") {
          const ref = await pool.query(
            `
            SELECT id FROM messages
            WHERE id = $1 AND conversation_id = $2
            LIMIT 1
            `,
            [replyToMessageId, conversationId],
          )
          if (ref.rowCount) replyToId = replyToMessageId
        }

        const insert = await pool.query(
          `
          INSERT INTO messages (conversation_id, sender_id, text, reply_to_id)
          VALUES ($1, $2, $3, $4)
          RETURNING id
          `,
          [conversationId, userId, text, replyToId],
        )
        const newId = insert.rows[0]?.id as string
        if (!newId) return

        const enriched = await pool.query(
          `
          SELECT
            m.id,
            m.conversation_id,
            m.sender_id,
            m.text,
            m.seen,
            m.created_at,
            m.updated_at,
            m.reply_to_id,
            rm.text AS reply_to_text,
            rm.sender_id AS reply_to_sender_id,
            ru.username AS reply_to_sender_username
          FROM messages m
          LEFT JOIN messages rm ON rm.id = m.reply_to_id
          LEFT JOIN users ru ON ru.id = rm.sender_id
          WHERE m.id = $1
          LIMIT 1
          `,
          [newId],
        )
        const message = enriched.rows[0]
        if (!message) return

        io.to(`conversation-${conversationId}`).emit(
          "new-message",
          message
        )

        const receivers = await pool.query(
          `
          SELECT u.id, u.email, u.username
          FROM conversation_members cm
          INNER JOIN users u ON u.id = cm.user_id
          WHERE cm.conversation_id = $1
            AND cm.user_id <> $2
          `,
          [conversationId, userId]
        )

        const senderResult = await pool.query(
          `SELECT username FROM users WHERE id = $1 LIMIT 1`,
          [userId]
        )
        const senderName = senderResult.rows[0]?.username || "Un ami"

        const appUrl = (process.env.FRONTEND_URL ?? "").trim()
        const conversationUrl = appUrl ? `${appUrl.replace(/\/+$/, "")}/discussion` : undefined
        const previewText = String(text ?? "").trim()

        for (const r of receivers.rows as Array<{ id: string; email: string; username: string }>) {
          const isRecipientOnline = onlineUsers.has(r.id) && (onlineUsers.get(r.id)?.size ?? 0) > 0
          if (isRecipientOnline) continue

          const pushSubs = await pool.query(
            `
            SELECT endpoint, p256dh, auth
            FROM push_subscriptions
            WHERE user_id = $1
            `,
            [r.id],
          )
          for (const sub of pushSubs.rows as Array<{ endpoint: string; p256dh: string; auth: string }>) {
            void sendWebPushNotification(sub, {
              title: `Nouveau message de ${senderName}`,
              body: previewText,
              url: "/discussion",
            }).catch(async (err: unknown) => {
              const statusCode = Number((err as { statusCode?: number })?.statusCode ?? 0)
              if (statusCode === 404 || statusCode === 410) {
                await pool.query(`DELETE FROM push_subscriptions WHERE endpoint = $1`, [sub.endpoint])
              } else {
                console.error("[push] send failed:", err)
              }
            })
          }

          if (!r.email) continue

          void sendNewMessageEmail({
            to: r.email,
            recipientName: r.username,
            senderName,
            previewText,
            conversationUrl,
          }).catch((err) => {
            console.error("[mail][new-message] send failed:", err)
          })
        }
      } catch (e) {
        console.error(e)
      }
    })

    socket.on("join-conversation", async ({ conversationId }: { conversationId: string }) => {
      if (!conversationId) return
      try {
        const memberCheck = await pool.query(
          `
          SELECT 1 FROM conversation_members
          WHERE conversation_id = $1 AND user_id = $2
          `,
          [conversationId, userId],
        )
        if (!memberCheck.rowCount) return
        socket.join(`conversation-${conversationId}`)
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