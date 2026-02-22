import React from "react"
import type { Conversation } from "../../types"
import type { MouseEventHandler } from "react"

interface Props {
  conversations: Conversation[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export function ConversationList({ conversations, selectedId, onSelect }: Props) {
  return (
    <div className="border-r">
      {conversations.length === 0 ? (
        <p className="p-4 text-sm text-slate-600">Aucune conversation</p>
      ) : (
        conversations.map((c) => (
          <button
            key={c.userId}
            onClick={() => onSelect(c.userId)}
            className={`w-full px-4 py-3 text-left hover:bg-slate-100 ${
              selectedId === c.userId ? "bg-slate-200" : ""
            }`}
          >
            <p className="font-medium">Utilisateur {c.userId}</p>
            <p className="text-sm text-slate-600 truncate">{c.lastMessage}</p>
          </button>
        ))
      )}
    </div>
  )
}