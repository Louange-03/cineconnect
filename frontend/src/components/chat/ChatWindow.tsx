import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"
import type { Message } from "../../types"

interface Props {
  messages: Message[]
  myId: number
  onSend: (content: string) => void
}

export function ChatWindow({ messages, myId, onSend }: Props): JSX.Element {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-600">Aucun message</p>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isMine={m.senderId === myId}
            />
          ))
        )}
      </div>

      <MessageInput onSend={onSend} />
    </div>
  )
}