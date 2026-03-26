import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
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
  process.env.OMDB_API_KEY = process.env.OMDB_API_KEY || "test_key"

  // Mock fetch used by searchOmdb controller
  globalThis.fetch = vi.fn(async () => {
    return {
      json: async () => ({
        Response: "True",
        totalResults: "1",
        Search: [
          {
            Title: "The Matrix",
            Year: "1999",
            imdbID: "tt0133093",
            Type: "movie",
            Poster: "https://example.com/poster.jpg",
          },
        ],
      }),
    } as any
  }) as any

  await new Promise<void>((resolve) => {
    httpServer.listen(0, () => resolve())
  })
})

afterAll(async () => {
  await new Promise<void>((resolve) => {
    httpServer.close(() => resolve())
  })
})

describe("OMDb proxy", () => {
  it("should return OMDb search results", async () => {
    const res = await request(httpServer).get("/api/films/omdb/search?q=matrix&page=1")
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty("Response", "True")
    expect(Array.isArray(res.body.Search)).toBe(true)
    expect(res.body.Search[0]).toHaveProperty("imdbID", "tt0133093")
  })

  it("should return empty Search when query missing", async () => {
    const res = await request(httpServer).get("/api/films/omdb/search")
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty("Search")
    expect(Array.isArray(res.body.Search)).toBe(true)
  })
})

