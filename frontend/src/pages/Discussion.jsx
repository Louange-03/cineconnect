import { useState } from "react"
import { useAuth } from "../hooks/useAuth"

import {
  getConversations,
  getMessagesWithUser,
  sendMessage,
} from "../lib/messages"

import { ConversationList } from "../components/chat/ConversationList"
import { ChatWindow } from "../components/chat/ChatWindow"

export function Discussion() {
  const { user } = useAuth()
  const myId = user?.id || "u_1"

  const conversations = getConversations(myId)

  // Initialize selection without useEffect to satisfy eslint rule
  const [selectedUserId, setSelectedUserId] = useState(() =>
    conversations.length > 0 ? conversations[0].userId : null
  )
  const [refresh, setRefresh] = useState(0)

  const messages = selectedUserId
    ? getMessagesWithUser(myId, selectedUserId)
    : []

  return (
    <div className="space-y-4">
      <div>
        <h1 className="h-display text-2xl font-semibold">Discussion</h1>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Un chat simple style Messenger/Discord.
        </p>
      </div>

      <div className="surface grid h-[72vh] grid-cols-1 overflow-hidden md:grid-cols-[320px_1fr]">
        <ConversationList
          conversations={conversations}
          selectedId={selectedUserId}
          onSelect={setSelectedUserId}
        />

        {selectedUserId ? (
          <ChatWindow
            key={`${selectedUserId}-${refresh}`}
            messages={messages}
            myId={myId}
            onSend={(content) => {
              sendMessage(myId, selectedUserId, content)
              setRefresh((x) => x + 1)
            }}
          />
        ) : (
          <div className="flex items-center justify-center p-6 text-sm text-[color:var(--muted)]">
            Sélectionne une conversation
          </div>
        )}
      </div>
    </div>
  )
}
