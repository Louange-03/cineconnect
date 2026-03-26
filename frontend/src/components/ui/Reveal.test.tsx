import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Reveal } from "./Reveal"

vi.mock("../../hooks/useInView", () => ({
  useInView: () => ({ ref: vi.fn(), inView: false }),
}))

describe("Reveal", () => {
  it("rend les enfants avec classe reveal", () => {
    render(
      <Reveal delayMs={50} className="extra">
        <span>Contenu</span>
      </Reveal>,
    )
    expect(screen.getByText("Contenu")).toBeInTheDocument()
    const wrap = screen.getByText("Contenu").parentElement
    expect(wrap?.className).toContain("cine-reveal")
    expect(wrap?.className).toContain("extra")
  })

  it("supporte as=\"section\"", () => {
    render(
      <Reveal as="section">
        <p>Bloc</p>
      </Reveal>,
    )
    expect(document.querySelector("section")).toBeTruthy()
  })
})
