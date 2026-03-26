import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const sendMail = vi.fn()
const createTransport = vi.fn(() => ({ sendMail }))

vi.mock("nodemailer", () => ({
  default: { createTransport },
}))

describe("mailer", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    sendMail.mockReset()
    createTransport.mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("isSmtpFullyConfigured false si variables manquantes", async () => {
    vi.stubEnv("SMTP_HOST", "")
    const { isSmtpFullyConfigured } = await import("../src/utils/mailer.js")
    expect(isSmtpFullyConfigured()).toBe(false)
  })

  it("SMTP_HOST undefined : coalesce vers chaîne vide", async () => {
    vi.resetModules()
    vi.unstubAllEnvs()
    delete process.env.SMTP_HOST
    const { isSmtpFullyConfigured } = await import("../src/utils/mailer.js")
    expect(isSmtpFullyConfigured()).toBe(false)
  })

  it("isSmtpConfigured null si port invalide", async () => {
    vi.stubEnv("SMTP_HOST", "h")
    vi.stubEnv("SMTP_PORT", "abc")
    vi.stubEnv("SMTP_USER", "u")
    vi.stubEnv("SMTP_PASS", "p")
    const { isSmtpFullyConfigured } = await import("../src/utils/mailer.js")
    expect(isSmtpFullyConfigured()).toBe(false)
  })

  it("isSmtpFullyConfigured true si SMTP complet", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com")
    vi.stubEnv("SMTP_PORT", "587")
    vi.stubEnv("SMTP_USER", "u")
    vi.stubEnv("SMTP_PASS", "p")
    vi.stubEnv("MAIL_FROM", "from@example.com")
    const { isSmtpFullyConfigured } = await import("../src/utils/mailer.js")
    expect(isSmtpFullyConfigured()).toBe(true)
  })

  it("sendPasswordResetEmail sans SMTP log et return", async () => {
    vi.stubEnv("SMTP_HOST", "")
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const { sendPasswordResetEmail } = await import("../src/utils/mailer.js")
    await sendPasswordResetEmail({ to: "a@b.co", resetUrl: "http://x/r" })
    expect(log).toHaveBeenCalled()
    log.mockRestore()
  })

  it("sendPasswordResetEmail avec SMTP appelle sendMail", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com")
    vi.stubEnv("SMTP_PORT", "587")
    vi.stubEnv("SMTP_USER", "u")
    vi.stubEnv("SMTP_PASS", "p")
    vi.stubEnv("MAIL_FROM", "from@example.com")
    sendMail.mockResolvedValue(undefined)
    const { sendPasswordResetEmail } = await import("../src/utils/mailer.js")
    await sendPasswordResetEmail({ to: "a@b.co", resetUrl: "http://x/r" })
    expect(createTransport).toHaveBeenCalled()
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "a@b.co", from: "from@example.com" }),
    )
  })

  it("MAIL_FROM absent : expéditeur = SMTP_USER", async () => {
    vi.resetModules()
    vi.unstubAllEnvs()
    vi.stubEnv("SMTP_HOST", "smtp.example.com")
    vi.stubEnv("SMTP_PORT", "587")
    vi.stubEnv("SMTP_USER", "onlyuser@example.com")
    vi.stubEnv("SMTP_PASS", "p")
    delete process.env.MAIL_FROM
    sendMail.mockResolvedValue(undefined)
    const { sendPasswordResetEmail } = await import("../src/utils/mailer.js")
    await sendPasswordResetEmail({ to: "a@b.co", resetUrl: "http://x/r" })
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ from: "onlyuser@example.com" }),
    )
  })

  it("sendPasswordResetEmail propage erreur sendMail", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com")
    vi.stubEnv("SMTP_PORT", "465")
    vi.stubEnv("SMTP_USER", "u")
    vi.stubEnv("SMTP_PASS", "p")
    vi.stubEnv("MAIL_FROM", "from@example.com")
    sendMail.mockRejectedValue(new Error("smtp down"))
    const { sendPasswordResetEmail } = await import("../src/utils/mailer.js")
    await expect(sendPasswordResetEmail({ to: "a@b.co", resetUrl: "http://x/r" })).rejects.toThrow(/SMTP/)
  })

  it("sendPasswordResetEmail formate erreur non-Error", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com")
    vi.stubEnv("SMTP_PORT", "465")
    vi.stubEnv("SMTP_USER", "u")
    vi.stubEnv("SMTP_PASS", "p")
    vi.stubEnv("MAIL_FROM", "from@example.com")
    sendMail.mockRejectedValue("boom")
    const { sendPasswordResetEmail } = await import("../src/utils/mailer.js")
    await expect(sendPasswordResetEmail({ to: "a@b.co", resetUrl: "http://x/r" })).rejects.toThrow(/SMTP/)
  })
})
