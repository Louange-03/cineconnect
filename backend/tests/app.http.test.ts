import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import request from "supertest"
import { createServer, type Server } from "http"
import type { Express } from "express"

describe("createApp", () => {
  let app: Express
  let httpServer: Server

  beforeAll(async () => {
    vi.unstubAllEnvs()
    delete process.env.FRONTEND_URL
    vi.resetModules()
    const { createApp } = await import("../src/app")
    app = createApp()
    httpServer = createServer(app)
    await new Promise<void>((resolve) => httpServer.listen(0, () => resolve()))
  }, 60_000)

  afterAll(async () => {
    if (!httpServer) return
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve())
    })
  })

  it("GET /health", async () => {
    const res = await request(httpServer).get("/health")
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })

  it("GET /", async () => {
    const res = await request(httpServer).get("/")
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.name).toContain("Cineconnect")
  })

  it("GET /api/docs-json", async () => {
    const res = await request(httpServer).get("/api/docs-json")
    expect(res.status).toBe(200)
    expect(res.body.openapi).toMatch(/^3\./)
  })

  it("CORS utilise FRONTEND_URL si défini", async () => {
    vi.stubEnv("FRONTEND_URL", "https://app.example.test")
    vi.resetModules()
    const { createApp: createAppFresh } = await import("../src/app")
    const fresh = createAppFresh()
    const srv = createServer(fresh)
    await new Promise<void>((r) => srv.listen(0, () => r()))
    try {
      const res = await request(srv).get("/health").set("Origin", "https://app.example.test")
      expect(res.status).toBe(200)
    } finally {
      await new Promise<void>((r) => srv.close(() => r()))
      vi.unstubAllEnvs()
      vi.resetModules()
    }
  })
})
