import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const ioFn = vi.hoisted(() => vi.fn((..._args: any[]) => ({ id: "mock-socket" })))

vi.mock("socket.io-client", () => ({
  io: (...args: any[]) => ioFn(...args),
}))

const getTokenMock = vi.hoisted(() => vi.fn(() => "jwt-1" as string | null))

vi.mock("./auth", () => ({
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
    await import("./socket")
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
    await import("./socket")
    expect(ioFn).toHaveBeenCalledWith(
      "http://api.example:3001",
      expect.objectContaining({ auth: { token: "jwt-1" } }),
    )
  })

  it("sinon localhost:3001", async () => {
    vi.stubEnv("VITE_SOCKET_URL", "")
    vi.stubEnv("VITE_API_URL", "")
    await import("./socket")
    expect(ioFn).toHaveBeenCalledWith("http://localhost:3001", expect.any(Object))
  })

  it("passe token vide si pas de jeton", async () => {
    getTokenMock.mockReturnValue(null)
    vi.stubEnv("VITE_SOCKET_URL", "")
    vi.stubEnv("VITE_API_URL", "")
    await import("./socket")
    expect(ioFn).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ auth: { token: "" } }),
    )
  })
})
