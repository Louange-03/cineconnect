import { io, Socket } from "socket.io-client"
import { getToken } from "./lib/auth"

const SOCKET_URL =
  (import.meta.env.VITE_SOCKET_URL as string | undefined) ||
  (import.meta.env.VITE_API_URL as string | undefined) ||
  "http://localhost:3001"

export const socket: Socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  auth: {
    token: getToken() ?? "",
  },
})

export function connectSocket() {
  socket.auth = { token: getToken() ?? "" }
  if (!socket.connected) socket.connect()
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect()
}