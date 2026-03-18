import { io, Socket } from "socket.io-client"
import { getToken } from "./lib/auth"

const token = getToken()

export const socket: Socket = io("http://localhost:3001", {
  withCredentials: true,
  auth: { token: token ?? "" },
  // Backend exige un token dans `handshake.auth.token`, donc on évite de connecter
  // tant qu'il n'y a pas de token (sinon la connexion est fermée immédiatement).
  autoConnect: Boolean(token),
})