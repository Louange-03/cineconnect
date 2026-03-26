import { afterEach, describe, expect, it, vi } from "vitest"
import { resolveFrontendOrigin } from "../src/app"

describe("resolveFrontendOrigin", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    delete process.env.FRONTEND_URL
  })

  it("défaut si variable absente", () => {
    delete process.env.FRONTEND_URL
    expect(resolveFrontendOrigin()).toBe("http://localhost:5173")
  })

  it("défaut si chaîne vide ou blanche", () => {
    vi.stubEnv("FRONTEND_URL", "")
    expect(resolveFrontendOrigin()).toBe("http://localhost:5173")
    vi.stubEnv("FRONTEND_URL", "   \t  ")
    expect(resolveFrontendOrigin()).toBe("http://localhost:5173")
  })

  it("retourne l’URL trimée si définie", () => {
    vi.stubEnv("FRONTEND_URL", "  https://cinema.test  ")
    expect(resolveFrontendOrigin()).toBe("https://cinema.test")
  })
})
