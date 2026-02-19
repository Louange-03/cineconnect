import { useState, FormEvent } from "react"

interface Props {
  onSend: (content: string) => void
}

export function MessageInput({ onSend }: Props): JSX.Element {
  const [value, setValue] = useState("")

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    onSend(value)
    setValue("")
  }

  return (
    <form onSubmit={submit} className="flex gap-2 border-t p-3">
      <input
        className="flex-1 rounded border px-3 py-2"
        placeholder="Écrire un message…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="rounded bg-black px-4 py-2 text-white">
        Envoyer
      </button>
    </form>
  )
}