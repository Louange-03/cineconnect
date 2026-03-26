import { beforeEach, describe, expect, it, vi } from "vitest"
import { fetchMe, fetchUsers } from "./userApi"

vi.mock("./apiClient", () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

import { apiClient } from "./apiClient"

describe("userApi", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset()
  })

  it("fetchMe appelle /api/auth/me", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ user: { id: "1", email: "a@b.co", username: "a" } })
    const r = await fetchMe()
    expect(r.user.username).toBe("a")
    expect(apiClient.get).toHaveBeenCalledWith("/api/auth/me")
  })

  it("fetchUsers appelle /api/users", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ users: [] })
    await fetchUsers()
    expect(apiClient.get).toHaveBeenCalledWith("/api/users")
  })
})
