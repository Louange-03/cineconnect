import { renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useFilms } from "./useFilms.omdb"
import { createTestQueryWrapper } from "../test/queryClientWrapper"

function jsonRes(
  body: object,
  ok = true,
  contentTypeOrOmit: string | "omit" = "application/json",
): Response {
  const omit = contentTypeOrOmit === "omit"
  const ct = omit ? null : contentTypeOrOmit
  return {
    ok,
    status: ok ? 200 : 500,
    headers: {
      get: (n: string) => {
        if (n.toLowerCase() !== "content-type") return null
        if (ct === null) return null
        return ct
      },
    },
    text: async () => JSON.stringify(body),
  } as Response
}

describe("useFilms (omdb module)", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("retourne data.films ou []", async () => {
    fetchMock.mockResolvedValue(jsonRes({ films: [{ id: "1", title: "B" }] }))
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useFilms("q"), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.data?.[0]?.title).toBe("B")
    })
  })

  it("passe q, category et year dans l’URL", async () => {
    fetchMock.mockResolvedValue(jsonRes({ films: [] }))
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useFilms("a", "b", "c"), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain("q=a")
    expect(url).toContain("category=b")
    expect(url).toContain("year=c")
    expect(url).toContain("limit=1200")
  })

  it("content-type absent → erreur", async () => {
    fetchMock.mockResolvedValue(jsonRes({ films: [] }, true, "omit"))
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useFilms("x"), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.error?.message).toMatch(/JSON/i)
    })
  })

  it("films absents → []", async () => {
    fetchMock.mockResolvedValue(jsonRes({}))
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useFilms(""), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.data).toEqual([])
    })
  })

  it("HTTP erreur", async () => {
    fetchMock.mockResolvedValue(jsonRes({}, false))
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useFilms("a"), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })

  it("réponse non JSON", async () => {
    fetchMock.mockResolvedValue(jsonRes({}, true, "text/plain"))
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useFilms("a"), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.error?.message).toMatch(/JSON/i)
    })
  })
})
