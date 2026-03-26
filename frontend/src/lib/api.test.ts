import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    headers: {
      get: (name: string) => (name.toLowerCase() === "content-type" ? "application/json; charset=utf-8" : null),
    },
    json: async () => body,
  } as Response
}

describe("api (legacy apiFetch)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it("concatène BASE_URL par défaut et retourne le JSON", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ a: 1 }))
    const { apiFetch } = await import("./api")
    const data = await apiFetch("/path")
    expect(data).toEqual({ a: 1 })
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3007/path",
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
      }),
    )
  })

  it("utilise VITE_API_URL quand défini", async () => {
    vi.stubEnv("VITE_API_URL", "http://custom:9")
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}))
    const { apiFetch } = await import("./api")
    await apiFetch("/x")
    expect(fetch).toHaveBeenCalledWith("http://custom:9/x", expect.any(Object))
  })

  it("réponse non JSON OK → null", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "text/html" },
    } as unknown as Response)
    const { apiFetch } = await import("./api")
    await expect(apiFetch("/html")).resolves.toBeNull()
  })

  it("fusionne les en-têtes et ajoute Authorization si token", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}))
    const { apiFetch } = await import("./api")
    await apiFetch("/t", {
      method: "POST",
      headers: { "X-Extra": "1" },
      token: "tok",
    })
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Extra": "1",
          Authorization: "Bearer tok",
        },
      }),
    )
  })

  it("sans token ni headers personnalisés", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}))
    const { apiFetch } = await import("./api")
    await apiFetch("/bare")
    const opts = vi.mocked(fetch).mock.calls[0][1] as RequestInit
    expect(opts.headers).toEqual({ "Content-Type": "application/json" })
  })

  it("erreur HTTP avec message JSON", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ message: "Interdit" }, false, 403))
    const { apiFetch } = await import("./api")
    await expect(apiFetch("/e")).rejects.toThrow("Interdit")
  })

  it("erreur HTTP sans message", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => "application/json" },
      json: async () => ({}),
    } as unknown as Response)
    const { apiFetch } = await import("./api")
    await expect(apiFetch("/e2")).rejects.toThrow(/500/)
  })

  it("erreur non JSON", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      headers: { get: () => "text/plain" },
    } as unknown as Response)
    const { apiFetch } = await import("./api")
    await expect(apiFetch("/e3")).rejects.toThrow(/502/)
  })
})
