import { useEffect, useState } from "react"
import { Send } from "lucide-react"
import { socket } from "../socket"
import axios from "axios"
import type { Conversation, Message } from "../types"

interface UserStatusPayload {
  userId: string
}

export function Discussion() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  const token = localStorage.getItem("token")
  const currentUserId = localStorage.getItem("userId")

  useEffect(() => {
    const fetchConversations = async () => {
      const res = await axios.get<Conversation[]>(
        "http://localhost:3001/conversations",
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setConversations(res.data)
    }

    fetchConversations()
  }, [token])

  useEffect(() => {
    if (!selected) return

    const fetchMessages = async () => {
      const res = await axios.get<Message[]>(
        `http://localhost:3001/conversations/${selected.id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessages(res.data)
    }

    fetchMessages()

    socket.emit("mark-as-seen", { conversationId: selected.id })
  }, [selected, token])

  useEffect(() => {
    socket.on("new-message", (message: Message) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on("user-online", (data: UserStatusPayload) => {
      setOnlineUsers((prev) =>
        prev.includes(data.userId) ? prev : [...prev, data.userId]
      )
    })

    socket.on("user-offline", (data: UserStatusPayload) => {
      setOnlineUsers((prev) =>
        prev.filter((id) => id !== data.userId)
      )
    })

    socket.on("user-typing", (data: UserStatusPayload) => {
      setTypingUsers((prev) =>
        prev.includes(data.userId) ? prev : [...prev, data.userId]
      )
    })

    socket.on("user-stop-typing", (data: UserStatusPayload) => {
      setTypingUsers((prev) =>
        prev.filter((id) => id !== data.userId)
      )
    })

    socket.on("messages-seen", () => {
      setMessages((prev) =>
        prev.map((m) =>
          m.sender_id === currentUserId
            ? { ...m, seen: true }
            : m
        )
      )
    })

    return () => {
      socket.off("new-message")
      socket.off("user-online")
      socket.off("user-offline")
      socket.off("user-typing")
      socket.off("user-stop-typing")
      socket.off("messages-seen")
    }
  }, [currentUserId])

  const sendMessage = () => {
    if (!selected || !newMessage.trim()) return

    socket.emit("send-message", {
      conversationId: selected.id,
      text: newMessage,
    })

    setNewMessage("")
  }

  const handleTyping = () => {
    if (!selected) return
    socket.emit("typing", { conversationId: selected.id })
  }

  const handleStopTyping = () => {
    if (!selected) return
    socket.emit("stop-typing", { conversationId: selected.id })
  }

  return (
    <div className="flex h-screen bg-prussian text-white">
      <div className="w-80 bg-navy flex flex-col">
        <div className="p-4 text-xl font-semibold border-b border-imperial">
          Messages
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelected(conv)}
              className="p-4 hover:bg-imperial cursor-pointer flex justify-between"
            >
              <div>
                <div>{conv.name}</div>
                <div className="text-sm text-frosted">
                  {conv.last_message}
                </div>
              </div>

              {conv.unread_count > 0 && (
                <div className="bg-ocean text-xs px-2 py-1 rounded-full">
                  {conv.unread_count}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white text-black">
        {selected ? (
          <>
            <div className="p-4 border-b">
              {selected.name}
            </div>

            <div className="flex-1 p-6 bg-frosted overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-xs p-3 rounded-2xl ${
                    msg.sender_id === currentUserId
                      ? "ml-auto bg-ocean text-white"
                      : "bg-white"
                  }`}
                >
                  {msg.text}

                  {msg.seen &&
                    msg.sender_id === currentUserId && (
                      <div className="text-xs mt-1 opacity-70">
                        Vu
                      </div>
                    )}
                </div>
              ))}

              {typingUsers.length > 0 && (
                <div className="text-sm text-gray-500">
                  En train d’écrire...
                </div>
              )}
            </div>

            <div className="p-4 border-t flex gap-3">
              <input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  handleTyping()
                }}
                onBlur={handleStopTyping}
                className="flex-1 border rounded-full px-4 py-2"
                placeholder="Écris un message..."
              />
              <button
                onClick={sendMessage}
                className="bg-imperial p-3 rounded-full text-white"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Sélectionne une conversation
          </div>
        )}
      </div>
    </div>
  )
}