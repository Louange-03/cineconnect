import { renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useReviews } from "./useReviews"
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

describe("useReviews", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("filmId vide : requête désactivée", async () => {
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useReviews(""), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.fetchStatus).toBe("idle")
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("charge les avis", async () => {
    fetchMock.mockResolvedValue(
      jsonRes({
        reviews: [
          { id: "r1", userId: "u", username: "a", rating: 4, comment: "", createdAt: "2020" },
        ],
      }),
    )
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useReviews("f1"), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.data?.[0]?.id).toBe("r1")
    })
    expect(fetchMock).toHaveBeenCalledWith("/api/reviews/film/f1", expect.any(Object))
  })

  it("reviews absents → []", async () => {
    fetchMock.mockResolvedValue(jsonRes({}))
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useReviews("f1"), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.data).toEqual([])
    })
  })

  it("erreur HTTP", async () => {
    fetchMock.mockResolvedValue(jsonRes({}, false))
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useReviews("f1"), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.error?.message).toMatch(/avis/i)
    })
  })

  it("content-type absent → erreur", async () => {
    fetchMock.mockResolvedValue(jsonRes({ reviews: [] }, true, "omit"))
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useReviews("f1"), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.error?.message).toMatch(/JSON/i)
    })
  })

  it("réponse non JSON", async () => {
    fetchMock.mockResolvedValue(jsonRes({}, true, "text/plain"))
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useReviews("f1"), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.error?.message).toMatch(/JSON/i)
    })
  })
})
