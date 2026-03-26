import { describe, expect, it, vi } from "vitest"
import express from "express"
import request from "supertest"
import { startConversationController } from "../src/controllers/messages.controllers"

vi.mock("../src/services/message.service.js", () => ({
  startConversation: vi.fn(),
}))

import { startConversation } from "../src/services/message.service.js"

describe("startConversationController", () => {
  it("200 avec conversationId", async () => {
    vi.mocked(startConversation).mockResolvedValue("cid-1")
    const app = express()
    app.use(express.json())
    app.post("/start", (req, res, next) => {
      ;(req as any).user = { id: "me" }
      next()
    }, startConversationController)
    const res = await request(app).post("/start").send({ userId: "other" })
    expect(res.status).toBe(200)
    expect(res.body.conversationId).toBe("cid-1")
  })

  it("400 si startConversation échoue", async () => {
    vi.mocked(startConversation).mockRejectedValue(new Error("x"))
    const app = express()
    app.use(express.json())
    app.post("/start", (req, res, next) => {
      ;(req as any).user = { id: "me" }
      next()
    }, startConversationController)
    const res = await request(app).post("/start").send({ userId: "other" })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })
})
