import { describe, expect, it, vi } from "vitest"

describe("auth notifyAuthChanged sans window", () => {
  it("setToken n’appelle pas dispatchEvent", async () => {
    const store: Record<string, string> = {}
    const ls = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v
      },
      removeItem: (k: string) => {
        delete store[k]
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k])
      },
      key: () => null,
      length: 0,
    }
    vi.stubGlobal("localStorage", ls as Storage)
    vi.stubGlobal("window", undefined as any)
    vi.resetModules()
    const { setToken } = await import("./auth")
    setToken("t")
    expect(store.cineconnect_token).toBe("t")
    vi.unstubAllGlobals()
    vi.resetModules()
  })
})
