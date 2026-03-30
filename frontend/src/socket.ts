import { io, Socket } from "socket.io-client"
import { getToken } from "./lib/auth"
import { readViteEnv } from "./lib/viteEnv"

/** URL explicite si API/socket sur un autre hôte. Sinon `io(opts)` = même origine (proxy nginx /socket.io/). */
function explicitSocketBackend(): string | undefined {
  const sock = readViteEnv("VITE_SOCKET_URL")?.trim().replace(/\/$/, "") ?? ""
  if (sock) return sock
  const api = readViteEnv("VITE_API_URL")?.trim().replace(/\/$/, "") ?? ""
  if (api) return api
  return undefined
}

function socketOptions() {
  return {
    withCredentials: true,
    autoConnect: false,
    auth: { token: getToken() ?? "" },
  }
}

const url = explicitSocketBackend()
export const socket: Socket = url ? io(url, socketOptions()) : io(socketOptions())

export function connectSocket() {
  socket.auth = { token: getToken() ?? "" }
  if (!socket.connected) socket.connect()
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect()
}
