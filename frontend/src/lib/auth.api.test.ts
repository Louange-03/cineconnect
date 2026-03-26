import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  clearToken,
  clearUser,
  fetchMe,
  forgotPassword,
  login,
  register,
  resetPassword,
} from "./auth"

vi.mock("./apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import { apiClient } from "./apiClient"

describe("auth API", () => {
  beforeEach(() => {
    clearToken()
    clearUser()
    vi.mocked(apiClient.get).mockReset()
    vi.mocked(apiClient.post).mockReset()
  })

  it("fetchMe sans jeton", async () => {
    await expect(fetchMe()).rejects.toThrow("Non connecté")
  })

  it("fetchMe met à jour l’utilisateur", async () => {
    localStorage.setItem("cineconnect_token", "t")
    vi.mocked(apiClient.get).mockResolvedValue({ user: { id: "1", email: "a@b.co", username: "a" } })
    const u = await fetchMe()
    expect(u?.username).toBe("a")
  })

  it("fetchMe sans user dans la réponse", async () => {
    localStorage.setItem("cineconnect_token", "t")
    vi.mocked(apiClient.get).mockResolvedValue({} as any)
    const u = await fetchMe()
    expect(u).toBeUndefined()
  })

  it("register et login enregistrent token et user", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      token: "t1",
      user: { id: "1", email: "a@b.co", username: "alice" },
    })
    await register({ email: "a@b.co", username: "alice", password: "x" })
    expect(localStorage.getItem("cineconnect_token")).toBe("t1")

    clearToken()
    clearUser()
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      token: "t2",
      user: { id: "2", email: "b@b.co", username: "bob" },
    })
    await login({ email: "b@b.co", password: "y" })
    expect(localStorage.getItem("cineconnect_token")).toBe("t2")
  })

  it("register sans token ne pollue pas le stockage", async () => {
    clearToken()
    clearUser()
    vi.mocked(apiClient.post).mockResolvedValueOnce({} as any)
    await register({ email: "a@b.co", username: "a", password: "p" })
    expect(localStorage.getItem("cineconnect_token")).toBeNull()
  })

  it("login sans token ni user", async () => {
    clearToken()
    clearUser()
    vi.mocked(apiClient.post).mockResolvedValueOnce({} as any)
    await login({ email: "a@b.co", password: "p" })
    expect(localStorage.getItem("cineconnect_token")).toBeNull()
  })

  it("register avec token seulement", async () => {
    clearToken()
    clearUser()
    vi.mocked(apiClient.post).mockResolvedValueOnce({ token: "only" } as any)
    await register({ email: "a@b.co", username: "a", password: "p" })
    expect(localStorage.getItem("cineconnect_token")).toBe("only")
    expect(localStorage.getItem("cineconnect_user")).toBeNull()
  })

  it("register avec user seulement", async () => {
    clearToken()
    clearUser()
    const user = { id: "9", email: "a@b.co", username: "solo" }
    vi.mocked(apiClient.post).mockResolvedValueOnce({ user } as any)
    await register({ email: "a@b.co", username: "a", password: "p" })
    expect(localStorage.getItem("cineconnect_token")).toBeNull()
    expect(JSON.parse(localStorage.getItem("cineconnect_user")!)).toEqual(user)
  })

  it("forgotPassword et resetPassword sans auth header côté client", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ message: "ok" })
    await forgotPassword({ email: "a@b.co" })
    expect(apiClient.post).toHaveBeenCalledWith("/api/auth/forgot-password", { email: "a@b.co" }, { auth: false })
    await resetPassword({ token: "x", password: "secret12" })
    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/auth/reset-password",
      { token: "x", password: "secret12" },
      { auth: false },
    )
  })
})
