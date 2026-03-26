import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useImportOmdbFilm, useOmdbSearch } from "./useOmdb"
import { getToken } from "../lib/auth"
import { createTestQueryWrapper } from "../test/queryClientWrapper"

vi.mock("../lib/auth", () => ({
  getToken: vi.fn(),
}))

describe("useOmdb hooks", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    vi.mocked(getToken).mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe("useOmdbSearch", () => {
    it("requête courte : désactivée", async () => {
      const { Wrapper } = createTestQueryWrapper()
      const { result } = renderHook(() => useOmdbSearch("ab"), { wrapper: Wrapper })
      await waitFor(() => {
        expect(result.current.fetchStatus).toBe("idle")
      })
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it("retourne Search", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          Response: "True",
          Search: [{ imdbID: "1", Title: "A", Year: "1", Type: "movie", Poster: "p" }],
        }),
      } as Response)
      const { Wrapper } = createTestQueryWrapper()
      const { result } = renderHook(() => useOmdbSearch("abc"), { wrapper: Wrapper })
      await waitFor(() => {
        expect(result.current.data?.[0]?.Title).toBe("A")
      })
      expect(fetchMock.mock.calls[0][0]).toContain(encodeURIComponent("abc"))
    })

    it("Response False → []", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ Response: "False", Error: "x" }),
      } as Response)
      const { Wrapper } = createTestQueryWrapper()
      const { result } = renderHook(() => useOmdbSearch("abcd"), { wrapper: Wrapper })
      await waitFor(() => {
        expect(result.current.data).toEqual([])
      })
    })

    it("sans Search → []", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ Response: "True" }),
      } as Response)
      const { Wrapper } = createTestQueryWrapper()
      const { result } = renderHook(() => useOmdbSearch("abcde"), { wrapper: Wrapper })
      await waitFor(() => {
        expect(result.current.data).toEqual([])
      })
    })

    it("HTTP erreur", async () => {
      fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) } as Response)
      const { Wrapper } = createTestQueryWrapper()
      const { result } = renderHook(() => useOmdbSearch("abcdef"), { wrapper: Wrapper })
      await waitFor(() => {
        expect(result.current.error?.message).toMatch(/OMDb/i)
      })
    })
  })

  describe("useImportOmdbFilm", () => {
    it("sans token", async () => {
      vi.mocked(getToken).mockReturnValue(null)
      const { Wrapper } = createTestQueryWrapper()
      const { result } = renderHook(() => useImportOmdbFilm(), { wrapper: Wrapper })
      await expect(result.current.mutateAsync("tt1")).rejects.toThrow(/connecte/i)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it("import OK invalide le cache films / catégories", async () => {
      vi.mocked(getToken).mockReturnValue("tok")
      fetchMock.mockResolvedValue({ ok: true, json: async () => ({ id: "1" }) } as Response)
      const { client, Wrapper } = createTestQueryWrapper()
      const spy = vi.spyOn(client, "invalidateQueries")
      const { result } = renderHook(() => useImportOmdbFilm(), { wrapper: Wrapper })
      await act(async () => {
        await result.current.mutateAsync("tt9")
      })
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/films/import",
        expect.objectContaining({ method: "POST" }),
      )
      expect(spy).toHaveBeenCalledWith({ queryKey: ["films"] })
      expect(spy).toHaveBeenCalledWith({ queryKey: ["categories"] })
    })

    it("erreur HTTP", async () => {
      vi.mocked(getToken).mockReturnValue("tok")
      fetchMock.mockResolvedValue({ ok: false, text: async () => "" } as Response)
      const { Wrapper } = createTestQueryWrapper()
      const { result } = renderHook(() => useImportOmdbFilm(), { wrapper: Wrapper })
      await expect(result.current.mutateAsync("ttx")).rejects.toThrow(/import/i)
    })
  })
})
