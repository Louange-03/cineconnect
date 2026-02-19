import type { ReactNode } from "react"

interface ContainerProps {
  children: ReactNode
}

export function Container({ children }: ContainerProps): JSX.Element {
  return <div className="mx-auto w-full max-w-6xl px-4 py-6">{children}</div>
}