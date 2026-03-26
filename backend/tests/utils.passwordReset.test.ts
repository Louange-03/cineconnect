import { describe, expect, it } from "vitest"
import { createPasswordResetToken, hashPasswordResetToken } from "../src/utils/passwordReset"

describe("passwordReset", () => {
  it("hashPasswordResetToken est déterministe", () => {
    const h = hashPasswordResetToken("abc")
    expect(h).toMatch(/^[a-f0-9]{64}$/)
    expect(hashPasswordResetToken("abc")).toBe(h)
  })

  it("createPasswordResetToken retourne raw + hash cohérents", () => {
    const { rawToken, tokenHash } = createPasswordResetToken()
    expect(rawToken.length).toBeGreaterThan(10)
    expect(tokenHash).toBe(hashPasswordResetToken(rawToken))
  })
})
