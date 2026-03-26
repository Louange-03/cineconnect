import { act, render, renderHook, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useInView } from "./useInView"

describe("useInView", () => {
  let callback: IntersectionObserverCallback
  const ioCtor = vi.fn()

  beforeEach(() => {
    ioCtor.mockReset()
    globalThis.IntersectionObserver = class {
      constructor(cb: IntersectionObserverCallback) {
        ioCtor(cb)
        callback = cb
      }

      observe = vi.fn()
      disconnect = vi.fn()
    } as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("sans nœud DOM : pas d’observer", () => {
    renderHook(() => useInView())
    expect(ioCtor).not.toHaveBeenCalled()
  })

  it("observe et bascule inView quand intersecting", () => {
    function Box() {
      const { ref, inView } = useInView({ threshold: 0.2 })
      return <div ref={ref} data-testid="box" data-in={String(inView)} />
    }
    render(<Box />)
    expect(screen.getByTestId("box").dataset.in).toBe("false")
    act(() => {
      callback(
        [{ isIntersecting: true, target: document.body } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    expect(screen.getByTestId("box").dataset.in).toBe("true")
  })

  it("ignore entrée non intersecting et entries vides", () => {
    function Box() {
      const { ref, inView } = useInView()
      return <div ref={ref} data-testid="box" data-in={String(inView)} />
    }
    render(<Box />)
    act(() => {
      callback(
        [{ isIntersecting: false, target: document.body } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    expect(screen.getByTestId("box").dataset.in).toBe("false")
    act(() => {
      callback([], {} as IntersectionObserver)
    })
    expect(screen.getByTestId("box").dataset.in).toBe("false")
  })
})
