import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import { db } from "./db/client"
import { users } from "./db/schema"
import { eq } from "drizzle-orm"

interface JwtPayload {
  id: number
}

const onlineUsers = new Map<number, Set<string>>()

export const initSocket = (io: Server) => {

  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error("Unauthorized"))

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
      socket.data.userId = decoded.id
      next()
    } catch {
      next(new Error("Unauthorized"))
    }
  })

  io.on("connection", async (socket) => {
    const userId = socket.data.userId as number

    // Ajouter socket
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set())
    }
    onlineUsers.get(userId)!.add(socket.id)

    io.emit("user-online", { userId })

    socket.on("disconnect", async () => {
      const sockets = onlineUsers.get(userId)
      if (!sockets) return

      sockets.delete(socket.id)

      if (sockets.size === 0) {
        onlineUsers.delete(userId)

        await db
          .update(users)
          .set({ lastSeen: new Date() })
          .where(eq(users.id, userId))

        io.emit("user-offline", { userId })
      }
    })
  })
}