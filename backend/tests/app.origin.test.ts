import { afterEach, describe, expect, it, vi } from "vitest"
import {
  resolveAllowedFrontendOrigins,
  resolveFrontendOrigin,
} from "../src/app"

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

describe("resolveAllowedFrontendOrigins", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    delete process.env.FRONTEND_URL
  })

  it("localhost: une seule origine", () => {
    vi.stubEnv("FRONTEND_URL", "http://localhost:5173")
    expect(resolveAllowedFrontendOrigins()).toEqual(["http://localhost:5173"])
  })

  it("hors localhost: ajoute la variante sans :8080 (Coolify / proxy)", () => {
    vi.stubEnv(
      "FRONTEND_URL",
      "http://web-abc.149.202.62.241.sslip.io:8080",
    )
    expect(resolveAllowedFrontendOrigins()).toEqual([
      "http://web-abc.149.202.62.241.sslip.io:8080",
      "http://web-abc.149.202.62.241.sslip.io",
    ])
  })
})
