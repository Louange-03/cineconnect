import { describe, expect, it, vi } from "vitest"
import express from "express"
import request from "supertest"
import { authMiddleware } from "../src/middlewares/auth"

vi.mock("../src/utils/tokens.js", () => ({
  verifyToken: vi.fn(),
}))

import { verifyToken } from "../src/utils/tokens.js"

describe("authMiddleware", () => {
  it("401 sans Bearer", async () => {
    const app = express()
    app.use(authMiddleware)
    app.get("/x", (_req, res) => res.json({ ok: true }))
    const res = await request(app).get("/x")
    expect(res.status).toBe(401)
  })

  it("401 Bearer invalide", async () => {
    vi.mocked(verifyToken).mockImplementation(() => {
      throw new Error("bad")
    })
    const app = express()
    app.use(authMiddleware)
    app.get("/x", (_req, res) => res.json({ ok: true }))
    const res = await request(app).get("/x").set("Authorization", "Bearer x")
    expect(res.status).toBe(401)
  })

  it("401 si payload sans id", async () => {
    vi.mocked(verifyToken).mockReturnValue({ email: "a@b.co" } as any)
    const app = express()
    app.use(authMiddleware)
    app.get("/x", (_req, res) => res.json({ ok: true }))
    const res = await request(app).get("/x").set("Authorization", "Bearer tok")
    expect(res.status).toBe(401)
  })

  it("next si token valide avec id", async () => {
    vi.mocked(verifyToken).mockReturnValue({ id: "u1", email: "a@b.co", username: "a" } as any)
    const app = express()
    app.use(authMiddleware)
    app.get("/x", (req, res) => res.json({ id: req.user?.id }))
    const res = await request(app).get("/x").set("Authorization", "Bearer tok")
    expect(res.status).toBe(200)
    expect(res.body.id).toBe("u1")
  })

  it("accepte userId à la place de id", async () => {
    vi.mocked(verifyToken).mockReturnValue({ userId: "u2", username: "b" } as any)
    const app = express()
    app.use(authMiddleware)
    app.get("/x", (req, res) => res.json({ id: req.user?.id }))
    const res = await request(app).get("/x").set("Authorization", "Bearer tok")
    expect(res.status).toBe(200)
    expect(res.body.id).toBe("u2")
  })
})
