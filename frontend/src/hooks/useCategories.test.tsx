import { renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCategories } from "./useCategories"
import { createTestQueryWrapper } from "../test/queryClientWrapper"

type JsonResOpts = { contentType?: string; omitContentType?: boolean }

function jsonRes(body: object, ok = true, opts?: JsonResOpts): Response {
  const omit = opts?.omitContentType === true
  const ct = omit ? null : (opts?.contentType ?? "application/json; charset=utf-8")
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

describe("useCategories", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("retourne les catégories", async () => {
    fetchMock.mockResolvedValue(jsonRes({ categories: [{ id: "1", name: "SF" }] }))
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useCategories(), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.data?.[0]?.name).toBe("SF")
    })
    expect(fetchMock).toHaveBeenCalledWith("/api/films/categories", expect.any(Object))
  })

  it("categories absentes → tableau vide", async () => {
    fetchMock.mockResolvedValue(jsonRes({}))
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useCategories(), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.data).toEqual([])
    })
  })

  it("HTTP erreur", async () => {
    fetchMock.mockResolvedValue(jsonRes({}, false))
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useCategories(), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.error?.message).toMatch(/catégories/i)
    })
  })

  it("content-type absent → erreur (pas du JSON)", async () => {
    fetchMock.mockResolvedValue(jsonRes({ categories: [] }, true, { omitContentType: true }))
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useCategories(), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.error?.message).toMatch(/JSON/i)
    })
  })

  it("réponse non JSON", async () => {
    fetchMock.mockResolvedValue(
      jsonRes(
        {},
        true,
        { contentType: "text/plain" },
      ) as Response,
    )
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useCategories(), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.error?.message).toMatch(/JSON/i)
    })
  })
})
