import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  applyTheme,
  getTheme,
  initTheme,
  setTheme,
  toggleTheme,
  type ThemeMode,
} from "./theme"

describe("theme", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ""
    document.documentElement.style.colorScheme = ""
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("getTheme lit localStorage", () => {
    localStorage.setItem("theme-mode", "light")
    expect(getTheme()).toBe("light")
  })

  it("getTheme suit prefers-color-scheme clair", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
    expect(getTheme()).toBe("light")
  })

  it("getTheme suit prefers-color-scheme sombre", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
    expect(getTheme()).toBe("dark")
  })

  it("getTheme ignore une valeur stockée invalide", () => {
    localStorage.setItem("theme-mode", "nope")
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
    expect(getTheme()).toBe("dark")
  })

  it("applyTheme bascule les classes", () => {
    applyTheme("light")
    expect(document.documentElement.classList.contains("theme-light")).toBe(true)
    applyTheme("dark")
    expect(document.documentElement.classList.contains("theme-dark")).toBe(true)
  })

  it("setTheme persiste et dispatch", () => {
    const spy = vi.spyOn(window, "dispatchEvent")
    setTheme("light")
    expect(localStorage.getItem("theme-mode")).toBe("light")
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it("toggleTheme alterne depuis dark", () => {
    localStorage.setItem("theme-mode", "dark")
    const next: ThemeMode = toggleTheme()
    expect(next).toBe("light")
  })

  it("toggleTheme alterne depuis light", () => {
    localStorage.setItem("theme-mode", "light")
    const next: ThemeMode = toggleTheme()
    expect(next).toBe("dark")
  })

  it("initTheme applique getTheme", () => {
    localStorage.setItem("theme-mode", "dark")
    initTheme()
    expect(document.documentElement.classList.contains("theme-dark")).toBe(true)
  })
})
