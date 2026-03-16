import { afterAll, beforeAll, describe, expect, it } from "vitest"
import request from "supertest"
import { createServer } from "http"
import express from "express"
import cors from "cors"

import { authRoutes } from "../src/routes/auth.routes"

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "*"

const app = express()
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }))
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

describe("Auth routes", () => {
  it("should reject login with invalid credentials", async () => {
    const res = await request(httpServer)
      .post("/api/auth/login")
      .send({ email: "unknown@example.com", password: "badpass" })

    expect(res.status).toBe(401)
  })
})

