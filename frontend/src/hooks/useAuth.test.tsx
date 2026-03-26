import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { useAuth } from "./useAuth"
import { createTestQueryWrapper } from "../test/queryClientWrapper"
import { fetchMe } from "../lib/userApi"
import { isAuthenticated } from "../lib/auth"

vi.mock("../lib/auth", () => ({
  isAuthenticated: vi.fn(),
}))

vi.mock("../lib/userApi", () => ({
  fetchMe: vi.fn(),
}))

describe("useAuth", () => {
  beforeEach(() => {
    vi.mocked(isAuthenticated).mockReset()
    vi.mocked(fetchMe).mockReset()
  })

  it("sans session : pas d’appel à fetchMe", async () => {
    vi.mocked(isAuthenticated).mockReturnValue(false)
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(fetchMe).not.toHaveBeenCalled()
    expect(result.current.user).toBeNull()
    expect(result.current.isAuth).toBe(false)
  })

  it("avec session : charge l’utilisateur", async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true)
    vi.mocked(fetchMe).mockResolvedValue({
      user: { id: "1", email: "a@b.co", username: "alice" },
    })
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.user?.username).toBe("alice")
    })
    expect(fetchMe).toHaveBeenCalled()
    expect(result.current.isAuth).toBe(true)
  })
})
