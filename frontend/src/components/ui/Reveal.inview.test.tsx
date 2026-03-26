import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Reveal } from "./Reveal"

vi.mock("../../hooks/useInView", () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}))

describe("Reveal inView", () => {
  it("applique la classe visible", () => {
    render(<Reveal>Visible</Reveal>)
    const el = screen.getByText("Visible")
    expect(el.className).toContain("cine-reveal--in")
  })
})
