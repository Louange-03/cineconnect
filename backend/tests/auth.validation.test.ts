import { afterAll, beforeAll, describe, expect, it } from "vitest"
import request from "supertest"
import { createServer } from "http"
import express from "express"
import cors from "cors"

import { authRoutes } from "../src/routes/auth.routes"

const app = express()
app.use(cors({ origin: "*", credentials: true }))
app.use(express.json())
app.use("/api/auth", authRoutes)

const httpServer = createServer(app)

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    httpServer.listen(0, () => resolve())
  })
})

afterAll(async () => {
  await new Promise<void>((resolve) => {
    httpServer.close(() => resolve())
  })
})

describe("Auth validation (sans effet de bord métier)", () => {
  it("register: 400 si champs manquants", async () => {
    const res = await request(httpServer).post("/api/auth/register").send({ email: "a@b.co" })
    expect(res.status).toBe(400)
  })

  it("forgot-password: 400 si email vide", async () => {
    const res = await request(httpServer).post("/api/auth/forgot-password").send({ email: "   " })
    expect(res.status).toBe(400)
  })

  it("reset-password: 400 si token ou mot de passe manquant", async () => {
    const res = await request(httpServer).post("/api/auth/reset-password").send({ token: "", password: "secret" })
    expect(res.status).toBe(400)
  })
})
