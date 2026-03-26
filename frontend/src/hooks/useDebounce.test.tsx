import { renderHook, act } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useDebounce } from "./useDebounce"

describe("useDebounce", () => {
  it("retarde la mise à jour", async () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ v, d }: { v: string; d: number }) => useDebounce(v, d), {
      initialProps: { v: "a", d: 100 },
    })
    expect(result.current).toBe("a")
    rerender({ v: "b", d: 100 })
    expect(result.current).toBe("a")
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe("b")
    vi.useRealTimers()
  })
})
