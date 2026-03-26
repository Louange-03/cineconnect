import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"
import { CompactSearchInput } from "./CompactSearchInput"

function ControlledSearch(props: { inputType?: "search" | "text"; initial?: string }) {
  const [value, setValue] = useState(props.initial ?? "")
  return (
    <CompactSearchInput
      value={value}
      onChange={setValue}
      inputType={props.inputType ?? "search"}
      placeholder="Test…"
    />
  )
}

describe("CompactSearchInput", () => {
  it("affiche le placeholder et la valeur initiale", () => {
    render(<ControlledSearch initial="abc" inputType="search" />)
    const input = screen.getByRole("searchbox")
    expect(input).toHaveValue("abc")
    expect(input).toHaveAttribute("placeholder", "Test…")
  })

  it("Escape vide le champ (composant contrôlé)", async () => {
    const user = userEvent.setup()
    render(<ControlledSearch initial="x" inputType="search" />)
    const input = screen.getByRole("searchbox")
    await user.click(input)
    await user.keyboard("{Escape}")
    expect(input).toHaveValue("")
  })

  it("saisie met à jour la valeur affichée", async () => {
    const user = userEvent.setup()
    render(<ControlledSearch initial="" inputType="text" />)
    const input = screen.getByRole("textbox")
    await user.type(input, "hi")
    expect(input).toHaveValue("hi")
  })

  it("bouton effacer vide le champ", async () => {
    const user = userEvent.setup()
    render(<ControlledSearch initial="x" inputType="search" />)
    const btn = screen.getByRole("button", { name: /effacer/i })
    await user.click(btn)
    expect(screen.getByRole("searchbox")).toHaveValue("")
  })
})
