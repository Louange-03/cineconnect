import { afterAll, beforeAll, describe, expect, it } from "vitest"
import request from "supertest"
import { createServer } from "http"
import express from "express"
import cors from "cors"

import { filmsRoutes } from "../src/routes/films.routes"

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "*"

const app = express()
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }))
app.use(express.json())
app.use("/api/films", filmsRoutes)

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

describe("Films routes", () => {
  it("should list films (even if empty)", async () => {
    const res = await request(httpServer).get("/api/films")
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty("films")
    expect(Array.isArray(res.body.films)).toBe(true)
  })

  it("should list categories", async () => {
    const res = await request(httpServer).get("/api/films/categories")
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty("categories")
    expect(Array.isArray(res.body.categories)).toBe(true)
  })
})

