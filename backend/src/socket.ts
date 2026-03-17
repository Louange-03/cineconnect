import { Server as HttpServer } from "http"
import { Server, Socket } from "socket.io"

interface Message {
  id: string
  conversationId: string
  senderId: string
  text: string
  createdAt: string
}

interface UserStatusPayload {
  userId: string
}

interface ClientToServerEvents {
  join_conversation: (conversationId: string) => void
  send_message: (msg: Message) => void
  edit_message: (data: { messageId: string; text: string }) => void
  delete_message: (messageId: string) => void
  typing: (data: { conversationId: string; userId: string }) => void
  stop_typing: (data: { conversationId: string; userId: string }) => void
}

interface ServerToClientEvents {
  receive_message: (msg: Message) => void
  message_edited: (msg: Message) => void
  message_deleted: (messageId: string) => void
  user_online: (data: UserStatusPayload) => void
  user_offline: (data: UserStatusPayload) => void
  user_typing: (data: UserStatusPayload) => void
  user_stop_typing: (data: UserStatusPayload) => void
}

export const initSocket = (httpServer: HttpServer, origin: string) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin, methods: ["GET", "POST"] },
  })

  const messages: Record<string, Message[]> = {}

  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log("Nouvelle connexion WebSocket:", socket.id)

    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId)
      console.log(`Socket ${socket.id} rejoint la conversation ${conversationId}`)
      if (messages[conversationId]) {
        messages[conversationId].forEach((msg) => socket.emit("receive_message", msg))
      }
    })

    socket.on("send_message", (msg) => {
      msg.createdAt = new Date().toISOString()
      messages[msg.conversationId] = messages[msg.conversationId] || []
      messages[msg.conversationId].push(msg)
      io.to(msg.conversationId).emit("receive_message", msg)
    })

    socket.on("edit_message", ({ messageId, text }) => {
      for (const convId in messages) {
        const idx = messages[convId].findIndex((m) => m.id === messageId)
        if (idx !== -1) {
          messages[convId][idx].text = text
          io.to(convId).emit("message_edited", messages[convId][idx])
          break
        }
      }
    })

    socket.on("delete_message", (messageId) => {
      for (const convId in messages) {
        const idx = messages[convId].findIndex((m) => m.id === messageId)
        if (idx !== -1) {
          messages[convId].splice(idx, 1)
          io.to(convId).emit("message_deleted", messageId)
          break
        }
      }
    })

    socket.on("typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("user_typing", { userId })
    })

    socket.on("stop_typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("user_stop_typing", { userId })
    })

    socket.on("disconnect", () => {
      console.log("Socket déconnectée:", socket.id)
    })
  })
}