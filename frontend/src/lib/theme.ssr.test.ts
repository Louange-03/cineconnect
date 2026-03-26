import { describe, expect, it, vi } from "vitest"

describe("theme SSR", () => {
  it("getTheme retourne dark sans window", async () => {
    vi.stubGlobal("window", undefined as any)
    vi.resetModules()
    const { getTheme } = await import("./theme")
    expect(getTheme()).toBe("dark")
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it("applyTheme noop sans document", async () => {
    vi.stubGlobal("document", undefined as any)
    vi.resetModules()
    const { applyTheme } = await import("./theme")
    expect(() => applyTheme("light")).not.toThrow()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it("setTheme noop sans window", async () => {
    vi.stubGlobal("window", undefined as any)
    vi.resetModules()
    const { setTheme } = await import("./theme")
    expect(() => setTheme("dark")).not.toThrow()
    vi.unstubAllGlobals()
    vi.resetModules()
  })
})
