import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { getTokenMock } = vi.hoisted(() => ({
  getTokenMock: vi.fn(() => null as string | null),
}))

vi.mock("./auth", () => ({
  getToken: getTokenMock,
}))

describe("apiClient VITE_API_URL", () => {
  beforeEach(() => {
    getTokenMock.mockReturnValue(null)
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => "{}",
      } as Response),
    )
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it("retire le slash final de la base et préfixe l’URL", async () => {
    vi.stubEnv("VITE_API_URL", "http://localhost:3001/")
    const { apiClient } = await import("./apiClient")
    await apiClient.get("/api/x", { auth: false })
    expect(vi.mocked(fetch)).toHaveBeenCalledWith("http://localhost:3001/api/x", expect.any(Object))
  })
})
