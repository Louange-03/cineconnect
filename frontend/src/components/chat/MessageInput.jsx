import { useState } from "react"

export function MessageInput({ onSend }) {
  const [value, setValue] = useState("")

  function submit(e) {
    e.preventDefault()
    if (!value.trim()) return
    onSend(value)
    setValue("")
  }

  return (
    <form
      onSubmit={submit}
      className="flex gap-2 border-t border-[color:var(--border)] bg-[color:var(--surface-solid)] p-3"
    >
      <input
        className="input flex-1"
        placeholder="Écrire un message…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="btn btn-primary" type="submit">
        Envoyer
      </button>
    </form>
  )
}
