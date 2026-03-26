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
    vi.stubEnv("MAIL_PROVIDER", "smtp")
    vi.stubEnv("MAILGUN_API_KEY", "")
    vi.stubEnv("MAILGUN_DOMAIN", "")
    vi.stubEnv("MAILGUN_FROM", "")
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
    vi.stubEnv("MAIL_PROVIDER", "smtp")
    vi.stubEnv("MAILGUN_API_KEY", "")
    vi.stubEnv("MAILGUN_DOMAIN", "")
    vi.stubEnv("MAILGUN_FROM", "")
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

  it("status mailgun demandé + configuré", async () => {
    vi.stubEnv("MAIL_PROVIDER", "mailgun")
    vi.stubEnv("MAILGUN_API_KEY", "key-123")
    vi.stubEnv("MAILGUN_DOMAIN", "mg.example.com")
    const { getMailTransportStatus } = await import("../src/utils/mailer.js")
    expect(getMailTransportStatus()).toEqual({
      requestedProvider: "mailgun",
      effectiveProvider: "mailgun",
      configured: true,
    })
  })

  it("status mailgun demandé + fallback smtp", async () => {
    vi.stubEnv("MAIL_PROVIDER", "mailgun")
    vi.stubEnv("MAILGUN_API_KEY", "")
    vi.stubEnv("MAILGUN_DOMAIN", "")
    vi.stubEnv("SMTP_HOST", "smtp.example.com")
    vi.stubEnv("SMTP_PORT", "587")
    vi.stubEnv("SMTP_USER", "u")
    vi.stubEnv("SMTP_PASS", "p")
    vi.stubEnv("MAIL_FROM", "from@example.com")
    const { getMailTransportStatus } = await import("../src/utils/mailer.js")
    expect(getMailTransportStatus()).toEqual({
      requestedProvider: "mailgun",
      effectiveProvider: "smtp",
      configured: true,
    })
  })

  it("status mailgun demandé + aucun transport", async () => {
    vi.stubEnv("MAIL_PROVIDER", "mailgun")
    vi.stubEnv("MAILGUN_API_KEY", "")
    vi.stubEnv("MAILGUN_DOMAIN", "")
    vi.stubEnv("SMTP_HOST", "")
    const { getMailTransportStatus } = await import("../src/utils/mailer.js")
    expect(getMailTransportStatus()).toEqual({
      requestedProvider: "mailgun",
      effectiveProvider: "none",
      configured: false,
    })
  })

  it("status smtp demandé + fallback mailgun", async () => {
    vi.stubEnv("MAIL_PROVIDER", "smtp")
    vi.stubEnv("MAILGUN_API_KEY", "key-123")
    vi.stubEnv("MAILGUN_DOMAIN", "mg.example.com")
    vi.stubEnv("SMTP_HOST", "")
    const { getMailTransportStatus } = await import("../src/utils/mailer.js")
    expect(getMailTransportStatus()).toEqual({
      requestedProvider: "smtp",
      effectiveProvider: "mailgun",
      configured: true,
    })
  })

  it("status auto + aucun provider", async () => {
    vi.stubEnv("MAIL_PROVIDER", "")
    vi.stubEnv("MAILGUN_API_KEY", "")
    vi.stubEnv("MAILGUN_DOMAIN", "")
    vi.stubEnv("SMTP_HOST", "")
    const { getMailTransportStatus } = await import("../src/utils/mailer.js")
    expect(getMailTransportStatus()).toEqual({
      requestedProvider: "auto",
      effectiveProvider: "none",
      configured: false,
    })
  })

  it("status auto + smtp configuré", async () => {
    vi.stubEnv("MAIL_PROVIDER", "")
    vi.stubEnv("MAILGUN_API_KEY", "")
    vi.stubEnv("MAILGUN_DOMAIN", "")
    vi.stubEnv("SMTP_HOST", "smtp.example.com")
    vi.stubEnv("SMTP_PORT", "587")
    vi.stubEnv("SMTP_USER", "u")
    vi.stubEnv("SMTP_PASS", "p")
    vi.stubEnv("MAIL_FROM", "from@example.com")
    const { getMailTransportStatus } = await import("../src/utils/mailer.js")
    expect(getMailTransportStatus()).toEqual({
      requestedProvider: "auto",
      effectiveProvider: "smtp",
      configured: true,
    })
  })

  it("status auto + mailgun configuré", async () => {
    vi.stubEnv("MAIL_PROVIDER", "")
    vi.stubEnv("MAILGUN_API_KEY", "key-123")
    vi.stubEnv("MAILGUN_DOMAIN", "mg.example.com")
    const { getMailTransportStatus } = await import("../src/utils/mailer.js")
    expect(getMailTransportStatus()).toEqual({
      requestedProvider: "auto",
      effectiveProvider: "mailgun",
      configured: true,
    })
  })

  it("sendPasswordResetEmail via Mailgun: succès", async () => {
    vi.stubEnv("MAIL_PROVIDER", "mailgun")
    vi.stubEnv("MAILGUN_API_KEY", "key-123")
    vi.stubEnv("MAILGUN_DOMAIN", "mg.example.com")
    vi.stubEnv("MAILGUN_FROM", "CineConnect <postmaster@mg.example.com>")
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "ok",
    } as Response)
    vi.stubGlobal("fetch", fetchMock)
    const { sendPasswordResetEmail } = await import("../src/utils/mailer.js")
    await sendPasswordResetEmail({ to: "a@b.co", resetUrl: "http://x/r" })
    expect(fetchMock).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it("sendPasswordResetEmail n'utilise pas Mailgun si provider=smtp", async () => {
    vi.stubEnv("MAIL_PROVIDER", "smtp")
    vi.stubEnv("MAILGUN_API_KEY", "key-123")
    vi.stubEnv("MAILGUN_DOMAIN", "mg.example.com")
    vi.stubEnv("MAILGUN_FROM", "CineConnect <postmaster@mg.example.com>")
    vi.stubEnv("SMTP_HOST", "smtp.example.com")
    vi.stubEnv("SMTP_PORT", "587")
    vi.stubEnv("SMTP_USER", "u")
    vi.stubEnv("SMTP_PASS", "p")
    vi.stubEnv("MAIL_FROM", "from@example.com")
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    sendMail.mockResolvedValue(undefined)
    const { sendPasswordResetEmail } = await import("../src/utils/mailer.js")
    await sendPasswordResetEmail({ to: "a@b.co", resetUrl: "http://x/r" })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(sendMail).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it("sendPasswordResetEmail auto sans Mailgun utilise SMTP", async () => {
    vi.stubEnv("MAIL_PROVIDER", "auto")
    vi.stubEnv("MAILGUN_API_KEY", "")
    vi.stubEnv("MAILGUN_DOMAIN", "")
    vi.stubEnv("MAILGUN_FROM", "")
    vi.stubEnv("SMTP_HOST", "smtp.example.com")
    vi.stubEnv("SMTP_PORT", "587")
    vi.stubEnv("SMTP_USER", "u")
    vi.stubEnv("SMTP_PASS", "p")
    vi.stubEnv("MAIL_FROM", "from@example.com")
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    sendMail.mockResolvedValue(undefined)
    const { sendPasswordResetEmail } = await import("../src/utils/mailer.js")
    await sendPasswordResetEmail({ to: "a@b.co", resetUrl: "http://x/r" })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(sendMail).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it("sendPasswordResetEmail via Mailgun: utilise MAIL_FROM en fallback", async () => {
    vi.stubEnv("MAIL_PROVIDER", "mailgun")
    vi.stubEnv("MAILGUN_API_KEY", "key-123")
    vi.stubEnv("MAILGUN_DOMAIN", "mg.example.com")
    delete process.env.MAILGUN_FROM
    vi.stubEnv("MAIL_FROM", "Fallback <fallback@example.com>")
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "ok",
    } as Response)
    vi.stubGlobal("fetch", fetchMock)
    const { sendPasswordResetEmail } = await import("../src/utils/mailer.js")
    await sendPasswordResetEmail({ to: "a@b.co", resetUrl: "http://x/r" })
    const body = (fetchMock.mock.calls[0][1] as RequestInit).body as string
    expect(body).toContain("from=Fallback+%3Cfallback%40example.com%3E")
    vi.unstubAllGlobals()
  })

  it("sendPasswordResetEmail via Mailgun: base URL par défaut", async () => {
    vi.stubEnv("MAIL_PROVIDER", "mailgun")
    vi.stubEnv("MAILGUN_API_KEY", "key-123")
    vi.stubEnv("MAILGUN_DOMAIN", "mg.example.com")
    vi.stubEnv("MAILGUN_FROM", "CineConnect <postmaster@mg.example.com>")
    delete process.env.MAILGUN_BASE_URL
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "ok",
    } as Response)
    vi.stubGlobal("fetch", fetchMock)
    const { sendPasswordResetEmail } = await import("../src/utils/mailer.js")
    await sendPasswordResetEmail({ to: "a@b.co", resetUrl: "http://x/r" })
    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain("https://api.mailgun.net/v3/mg.example.com/messages")
    vi.unstubAllGlobals()
  })

  it("sendPasswordResetEmail via Mailgun: from manquant", async () => {
    vi.stubEnv("MAIL_PROVIDER", "mailgun")
    vi.stubEnv("MAILGUN_API_KEY", "key-123")
    vi.stubEnv("MAILGUN_DOMAIN", "mg.example.com")
    vi.stubEnv("MAILGUN_FROM", "")
    vi.stubEnv("MAIL_FROM", "")
    const { sendPasswordResetEmail } = await import("../src/utils/mailer.js")
    await expect(sendPasswordResetEmail({ to: "a@b.co", resetUrl: "http://x/r" })).rejects.toThrow(/MAILGUN_FROM/)
  })

  it("sendPasswordResetEmail via Mailgun: erreur API", async () => {
    vi.stubEnv("MAIL_PROVIDER", "mailgun")
    vi.stubEnv("MAILGUN_API_KEY", "key-123")
    vi.stubEnv("MAILGUN_DOMAIN", "mg.example.com")
    vi.stubEnv("MAILGUN_FROM", "CineConnect <postmaster@mg.example.com>")
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "invalid key",
    } as Response)
    vi.stubGlobal("fetch", fetchMock)
    const { sendPasswordResetEmail } = await import("../src/utils/mailer.js")
    await expect(sendPasswordResetEmail({ to: "a@b.co", resetUrl: "http://x/r" })).rejects.toThrow(/Mailgun/)
    vi.unstubAllGlobals()
  })

  it("sendPasswordResetEmail via Mailgun: erreur API sans body texte", async () => {
    vi.stubEnv("MAIL_PROVIDER", "mailgun")
    vi.stubEnv("MAILGUN_API_KEY", "key-123")
    vi.stubEnv("MAILGUN_DOMAIN", "mg.example.com")
    vi.stubEnv("MAILGUN_FROM", "CineConnect <postmaster@mg.example.com>")
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => {
        throw new Error("boom")
      },
    } as Response)
    vi.stubGlobal("fetch", fetchMock)
    const { sendPasswordResetEmail } = await import("../src/utils/mailer.js")
    await expect(sendPasswordResetEmail({ to: "a@b.co", resetUrl: "http://x/r" })).rejects.toThrow(/Mailgun/)
    vi.unstubAllGlobals()
  })
})
