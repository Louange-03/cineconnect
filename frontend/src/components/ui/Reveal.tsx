import React from "react"
import { useInView } from "../../hooks/useInView"

type RevealProps = {
  children: React.ReactNode
  className?: string
  delayMs?: number
  as?: keyof JSX.IntrinsicElements
}

export function Reveal({ children, className = "", delayMs = 0, as = "div" }: RevealProps) {
  const { ref, inView } = useInView({ threshold: 0.15, rootMargin: "0px 0px -10% 0px" })
  const Tag = as as any

  return (
    <Tag
      ref={ref}
      className={[
        "motion-safe:transition-opacity",
        inView ? "cine-reveal--in" : "cine-reveal",
        className,
      ].join(" ")}
      style={{ ["--reveal-delay" as any]: `${delayMs}ms` }}
    >
      {children}
    </Tag>
  )
}

