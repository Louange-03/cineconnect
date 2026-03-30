import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const ioFn = vi.hoisted(() =>
  vi.fn(() => ({
    id: "mock-socket",
    auth: { token: "" as string },
    connected: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
)

vi.mock("socket.io-client", () => ({
  io: (...args: any[]) => ioFn(...args),
}))

const getTokenMock = vi.hoisted(() => vi.fn(() => "jwt-1" as string | null))

vi.mock("../lib/auth", () => ({
  getToken: getTokenMock,
}))

describe("lib/socket", () => {
  beforeEach(() => {
    ioFn.mockClear()
    getTokenMock.mockReturnValue("jwt-1")
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it("utilise VITE_SOCKET_URL en priorité", async () => {
    vi.stubEnv("VITE_SOCKET_URL", "wss://sock.example")
    vi.stubEnv("VITE_API_URL", "http://ignored")
    await import("../socket")
    expect(ioFn).toHaveBeenCalledWith(
      "wss://sock.example",
      expect.objectContaining({
        autoConnect: false,
        withCredentials: true,
        auth: { token: "jwt-1" },
      }),
    )
  })

  it("sinon VITE_API_URL", async () => {
    vi.stubEnv("VITE_SOCKET_URL", "")
    vi.stubEnv("VITE_API_URL", "http://api.example:3001")
    await import("../socket")
    expect(ioFn).toHaveBeenCalledWith(
      "http://api.example:3001",
      expect.objectContaining({ auth: { token: "jwt-1" } }),
    )
  })

  it("sinon io(opts) ou URL explicite selon l’environnement", async () => {
    vi.stubEnv("VITE_SOCKET_URL", "")
    vi.stubEnv("VITE_API_URL", "")
    await import("../socket")
    expect(ioFn).toHaveBeenCalledTimes(1)
    const args = ioFn.mock.calls[0]
    const opts = args.length === 2 ? args[1] : args[0]
    expect(opts).toEqual(
      expect.objectContaining({
        autoConnect: false,
        withCredentials: true,
        auth: { token: "jwt-1" },
      }),
    )
    if (args.length === 2) {
      expect(typeof args[0]).toBe("string")
      expect(args[0] as string).toMatch(/^https?:\/\//)
    }
  })

  it("passe token vide si pas de jeton", async () => {
    getTokenMock.mockReturnValue(null)
    vi.stubEnv("VITE_SOCKET_URL", "")
    vi.stubEnv("VITE_API_URL", "")
    await import("../socket")
    const args = ioFn.mock.calls[0]
    const opts = args.length === 2 ? args[1] : args[0]
    expect(opts).toEqual(expect.objectContaining({ auth: { token: "" } }))
  })

  it("connectSocket met à jour le token et connecte si besoin", async () => {
    vi.stubEnv("VITE_SOCKET_URL", "wss://sock.example")
    vi.stubEnv("VITE_API_URL", "")
    const { connectSocket, socket } = await import("../socket")
    getTokenMock.mockReturnValue("tok-2")
    Object.assign(socket, { connected: false })
    connectSocket()
    expect(socket.auth).toEqual({ token: "tok-2" })
    expect(socket.connect).toHaveBeenCalled()
  })

  it("connectSocket ne reconnecte pas si déjà connecté", async () => {
    vi.stubEnv("VITE_SOCKET_URL", "wss://sock.example")
    const { connectSocket, socket } = await import("../socket")
    Object.assign(socket, { connected: true })
    connectSocket()
    expect(socket.connect).not.toHaveBeenCalled()
  })

  it("disconnectSocket appelle disconnect si connecté", async () => {
    vi.stubEnv("VITE_SOCKET_URL", "wss://sock.example")
    const { disconnectSocket, socket } = await import("../socket")
    Object.assign(socket, { connected: true })
    disconnectSocket()
    expect(socket.disconnect).toHaveBeenCalled()
  })

  it("disconnectSocket ne fait rien si déjà déconnecté", async () => {
    vi.stubEnv("VITE_SOCKET_URL", "wss://sock.example")
    const { disconnectSocket, socket } = await import("../socket")
    Object.assign(socket, { connected: false })
    disconnectSocket()
    expect(socket.disconnect).not.toHaveBeenCalled()
  })
})
