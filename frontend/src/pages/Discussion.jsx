import { useEffect, useState } from "react"
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

  const [selectedUserId, setSelectedUserId] = useState(null)
  const [refresh, setRefresh] = useState(0)

  const conversations = getConversations(myId)
  const messages = selectedUserId
    ? getMessagesWithUser(myId, selectedUserId)
    : []

  useEffect(() => {
    if (!selectedUserId && conversations.length > 0) {
      setSelectedUserId(conversations[0].userId)
    }
  }, [conversations, selectedUserId])

  return (
    <div className="grid h-[70vh] grid-cols-[260px_1fr] overflow-hidden rounded border">
      <ConversationList
        conversations={conversations}
        selectedId={selectedUserId}
        onSelect={setSelectedUserId}
      />

      {selectedUserId ? (
        <ChatWindow
          messages={messages}
          myId={myId}
          onSend={(content) => {
            sendMessage(myId, selectedUserId, content)
            setRefresh((x) => x + 1)
          }}
        />
      ) : (
        <div className="flex items-center justify-center text-slate-600">
          Sélectionne une conversation
        </div>
      )}
    </div>
  )
}
