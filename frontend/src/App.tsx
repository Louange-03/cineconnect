// src/App.tsx
import React, { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import Sidebar from "./components/chat/Sidebar"
import ChatWindow from "./components/chat/ChatWindow"
import { ChatConversation, ChatMessage } from "./types"

const socket: Socket = io("http://localhost:3000", {
  auth: { token: localStorage.getItem("jwt") }
})

const App: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null)

  useEffect(() => {
    socket.on("new_message", (msg: ChatMessage) => {
      setConversations(prev =>
        prev.map(conv =>
          conv.id === msg.conversationId
            ? {
                ...conv,
                lastMessage: msg.content,
                unread: activeConversation?.id === conv.id
                  ? 0
                  : conv.unread + 1
              }
            : conv
        )
      )
    })

    return () => {
      socket.disconnect()
    }
  }, [activeConversation])

  return (
    <div className="flex h-screen">
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversation}
        setActiveConversation={setActiveConversation}
        setConversations={setConversations}
      />
      <ChatWindow
        conversation={activeConversation}
        socket={socket}
      />
    </div>
  )
}

export default App