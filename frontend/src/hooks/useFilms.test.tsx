import { renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useFilms } from "./useFilms"
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

describe("useFilms", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("construit la query string avec q, category, year", async () => {
    fetchMock.mockResolvedValue(
      jsonRes({ films: [{ id: "1", title: "A", year: "2020" }] }),
    )
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useFilms("x", "c", "2021"), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.data?.[0]?.title).toBe("A")
    })
    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain("q=x")
    expect(url).toContain("category=c")
    expect(url).toContain("year=2021")
    expect(url).toContain("limit=10000")
  })

  it("films non tableau → []", async () => {
    fetchMock.mockResolvedValue(jsonRes({ films: { x: 1 } }))
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
      expect(result.current.error?.message).toMatch(/films/i)
    })
  })

  it("content-type absent → erreur", async () => {
    fetchMock.mockResolvedValue(jsonRes({ films: [] }, true, "omit"))
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useFilms("z"), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.error?.message).toMatch(/JSON/i)
    })
  })

  it("corps non JSON", async () => {
    fetchMock.mockResolvedValue(jsonRes({}, true, "text/html"))
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useFilms("a"), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.error?.message).toMatch(/JSON/i)
    })
  })
})
