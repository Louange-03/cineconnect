import { beforeEach, describe, expect, it, vi } from "vitest"
import { omdbGetById, omdbSearch } from "./omdb"

vi.mock("./apiClient", () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

import { apiClient } from "./apiClient"

describe("omdb", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset()
  })

  it("omdbSearch chaîne vide → []", async () => {
    await expect(omdbSearch("")).resolves.toEqual([])
    expect(apiClient.post).not.toHaveBeenCalled()
  })

  it("omdbSearch retourne Search ou []", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      Search: [{ imdbID: "1", Title: "A", Year: "2020", Type: "movie", Poster: "x" }],
    })
    const r = await omdbSearch("a")
    expect(r).toHaveLength(1)
    expect(apiClient.post).toHaveBeenCalledWith("/api/films/search", { query: "a" }, { auth: false })
  })

  it("omdbSearch sans Search dans la réponse", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({})
    await expect(omdbSearch("q")).resolves.toEqual([])
  })

  it("omdbGetById délègue au backend", async () => {
    const detail = { imdbID: "x", Title: "T", Year: "1", Type: "movie", Poster: "p" }
    vi.mocked(apiClient.post).mockResolvedValueOnce(detail)
    await expect(omdbGetById("x")).resolves.toEqual(detail)
    expect(apiClient.post).toHaveBeenCalledWith("/api/films/detail", { id: "x" }, { auth: false })
  })
})
