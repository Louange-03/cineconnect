import { io, Socket } from "socket.io-client"
import { useEffect, useState } from "react"
import Sidebar from "../components/chat/Sidebar" 
import ChatWindow from "../components/chat/ChatWindow"
import { ChatConversation } from "../types"
export function Discussions() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [activeConversation, setActiveConversation] =
    useState<ChatConversation | null>(null)


  useEffect(() => {
    const newSocket = io("http://localhost:3000", {
      auth: { token: localStorage.getItem("jwt") },
    })

    newSocket.on("connect", () => console.log("✅ Socket connecté", newSocket.id))

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  // Mock conversations pour tester l'affichage
  useEffect(() => {
    setConversations([
      { id: "1", name: "Alice", lastMessage: "Salut !", unread: 2 },
      { id: "2", name: "Bob", lastMessage: "Hello !", unread: 0 },
    ])
  }, [])

  if (!socket) return <div>Chargement du chat...</div>

  return (
    <div className="flex h-screen bg-prussian-blue">
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
}import { useEffect, useState } from "react"
import { useSearch } from "@tanstack/react-router"

type Message = {
  id: string
  senderId: string
  content: string
  createdAt: string
}

type ConversationResponse = {
  conversationId: string
  messages: Message[]
}

const API = "http://localhost:3001"

function authHeader(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("cineconnect_token")}`,
  }
}

export function Discussion(): JSX.Element {
  const { userId } = useSearch({ from: "/discussion" }) as {
    userId?: string
  }

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const initConversation = async (): Promise<void> => {
      try {
        const res = await fetch(`${API}/conversations/start`, {
          method: "POST",
          headers: authHeader(),
          body: JSON.stringify({ userId }),
        })

        if (!res.ok) {
          setError("Impossible d’ouvrir la conversation")
          return
        }

        const data = (await res.json()) as ConversationResponse
        setConversationId(data.conversationId)
        setMessages(data.messages)
      } catch {
        setError("Erreur serveur")
      }
    }

    initConversation()
  }, [userId])

  const sendMessage = async (): Promise<void> => {
    if (!conversationId || !newMessage.trim()) return

    const res = await fetch(`${API}/messages`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({
        conversationId,
        content: newMessage,
      }),
    })

    if (!res.ok) return

    const message = (await res.json()) as Message
    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  if (!userId) {
    return (
      <div className="p-6 text-slate-600">
        Sélectionne un ami pour commencer une discussion.
      </div>
    )
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  return (
    <div className="flex flex-col h-[80vh] border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="rounded-lg bg-slate-100 p-3 w-fit max-w-[70%]"
          >
            <p>{msg.content}</p>
            <span className="text-xs text-slate-500">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      <div className="flex border-t p-3 gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écris un message..."
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Envoyer
        </button>
      </div>
    </div>
  )
}