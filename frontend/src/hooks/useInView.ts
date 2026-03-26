import { useEffect, useRef, useState } from "react"

export function useInView<T extends Element>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return

    const obs = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry?.isIntersecting) {
        setInView(true)
        obs.disconnect()
      }
    }, options)

    obs.observe(el)
    return () => obs.disconnect()
  }, [options, inView])

  return { ref, inView } as const
}

