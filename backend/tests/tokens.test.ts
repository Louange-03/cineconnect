import { afterEach, describe, expect, it, vi } from "vitest"

describe("JWT tokens", () => {
  afterEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it("signToken puis verifyToken retourne le payload", async () => {
    vi.stubEnv("JWT_SECRET", "test-jwt-secret-ci")
    const { signToken, verifyToken } = await import("../src/utils/tokens.js")

    const token = signToken({
      id: "11111111-1111-1111-1111-111111111111",
      email: "t@example.com",
      username: "tester",
    })
    const payload = verifyToken(token)

    expect(payload.id).toBe("11111111-1111-1111-1111-111111111111")
    expect(payload.email).toBe("t@example.com")
    expect(payload.username).toBe("tester")
  })

  it("utilise le secret par défaut si JWT_SECRET absent", async () => {
    vi.unstubAllEnvs()
    vi.resetModules()
    delete process.env.JWT_SECRET
    const { signToken, verifyToken } = await import("../src/utils/tokens.js")
    const token = signToken({ id: "u", email: "a@b.co", username: "a" })
    expect(verifyToken(token).id).toBe("u")
  })
})
