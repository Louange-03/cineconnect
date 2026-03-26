import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "./apiClient"

const { getTokenMock } = vi.hoisted(() => ({
  getTokenMock: vi.fn(() => null as string | null),
}))

vi.mock("./auth", () => ({
  getToken: getTokenMock,
}))

describe("apiClient", () => {
  beforeEach(() => {
    getTokenMock.mockReturnValue(null)
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({ message: "ok", count: 1 }),
      } as Response)
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("parse une réponse JSON OK", async () => {
    const data = await apiClient.get("/api/x", { auth: false })
    expect(data).toEqual({ message: "ok", count: 1 })
  })

  it("réponse OK avec corps vide → null", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => "",
    } as Response)
    const data = await apiClient.get("/api/empty-ok", { auth: false })
    expect(data).toBeNull()
  })

  it("POST envoie le corps JSON", async () => {
    const data = await apiClient.post("/api/x", { a: 1 }, { auth: false })
    expect(data).toEqual({ message: "ok", count: 1 })
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      "/api/x",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ a: 1 }) }),
    )
  })

  it("auth par défaut sans jeton n’ajoute pas Authorization", async () => {
    getTokenMock.mockReturnValue(null)
    await apiClient.get("/api/open")
    const opts = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit
    expect(opts.headers).toEqual({ "Content-Type": "application/json" })
  })

  it("ajoute Authorization si auth et jeton", async () => {
    getTokenMock.mockReturnValue("mytok")
    await apiClient.get("/api/me")
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer mytok" }),
      }),
    )
  })

  it("normalise le chemin sans slash initial", async () => {
    await apiClient.get("api/no-leading", { auth: false })
    expect(vi.mocked(fetch)).toHaveBeenCalledWith("/api/no-leading", expect.any(Object))
  })

  it("propage le message serveur si JSON d’erreur", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      text: async () => JSON.stringify({ message: "Ressource introuvable" }),
    } as Response)

    await expect(apiClient.get("/api/y", { auth: false })).rejects.toThrow("Ressource introuvable")
  })

  it("erreur HTTP sans message dans le JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => JSON.stringify({}),
    } as Response)
    await expect(apiClient.get("/api/nomsg", { auth: false })).rejects.toThrow(/403/)
  })

  it("erreur lisible si corps non JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 502,
      text: async () => "<html>bad gateway</html>",
    } as Response)

    await expect(apiClient.get("/api/z", { auth: false })).rejects.toThrow(/html/i)
  })

  it("enveloppe une erreur non-Error", async () => {
    vi.mocked(fetch).mockRejectedValueOnce("plain")
    await expect(apiClient.get("/api/e", { auth: false })).rejects.toThrow("plain")
  })

  it("rejette si le corps n’est pas du JSON valide (réponse OK)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => "not-json{",
    } as Response)
    await expect(apiClient.get("/api/badjson", { auth: false })).rejects.toThrow(/not-json/i)
  })
})
