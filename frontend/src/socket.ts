import { io, Socket } from "socket.io-client"

/** Connexion Socket.IO — le backend exige `handshake.auth.token` (JWT). */
export const socket: Socket = io(
  import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3001",
  {
    withCredentials: true,
    auth: {
      token: typeof localStorage !== "undefined" ? localStorage.getItem("token") ?? "" : "",
    },
  }
)