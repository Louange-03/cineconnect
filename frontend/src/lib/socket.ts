import { io, Socket } from "socket.io-client"
import { getToken } from "./auth"

const SOCKET_URL =
  (import.meta.env.VITE_SOCKET_URL as string | undefined) ||
  (import.meta.env.VITE_API_URL as string | undefined) ||
  "http://localhost:3001"

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  auth: {
    token: getToken() ?? "",
  },
})