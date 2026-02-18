import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"

export function ChatWindow({ messages, myId, onSend }) {
  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="border-b border-[color:var(--border)] bg-[color:var(--surface-solid)] p-4">
        <p className="text-sm font-semibold">Messages</p>
        <p className="text-xs text-[color:var(--muted)]">
          {messages.length} message(s)
        </p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-[color:var(--muted)]">Aucun message</p>
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
