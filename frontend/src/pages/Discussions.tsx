import { useEffect, useState, useRef } from "react"
import { Send } from "lucide-react"
import { socket } from "../socket"
import axios from "axios"
import type { Conversation, Message } from "../types"
import EmojiPicker, { EmojiClickData } from "emoji-picker-react"

interface UserStatusPayload {
  userId: string
}

export function Discussion() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Conversation[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [emojiPickerOpenFor, setEmojiPickerOpenFor] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement | null>(null)

  const token = localStorage.getItem("token") ?? ""
  const currentUserId = localStorage.getItem("userId") ?? ""

  const formatTime = (date: string) => {
    const d = new Date(date)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const toggleEmojiPicker = (messageId: string) => {
    setEmojiPickerOpenFor((prev) => (prev === messageId ? null : messageId))
  }

  const getMessageById = (id: string) =>
    messages.find((m) => m.id === id)?.text || ""

  const addEmojiToMessage = (messageId: string, emoji: EmojiClickData) => {
    const newText = getMessageById(messageId) + emoji.emoji
    socket.emit("edit-message", { messageId, newText })
    setEmojiPickerOpenFor(null)
  }

  const editMessage = (msg: Message) => {
    const newText = prompt("Modifier le message :", msg.text)
    if (newText && newText.trim()) {
      socket.emit("edit-message", { messageId: msg.id, newText })
    }
  }

  const deleteMessage = (messageId: string) => {
    if (confirm("Supprimer ce message ?")) {
      socket.emit("delete-message", { messageId })
    }
  }

  useEffect(() => {
    const fetchConversations = async () => {
      const res = await axios.get<Conversation[]>("/api/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setConversations(res.data)
    }
    fetchConversations()
  }, [token])

  useEffect(() => {
    if (!selected) return

    const fetchMessages = async () => {
      const res = await axios.get<Message[]>(
        `/api/conversations/${selected.id}/messages`,
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

    socket.on("edit-message", (message: Message) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id ? { ...m, text: message.text } : m
        )
      )
    })

    socket.on("delete-message", (messageId: string) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
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

    return () => {
      socket.off("new-message")
      socket.off("edit-message")
      socket.off("delete-message")
      socket.off("user-online")
      socket.off("user-offline")
      socket.off("user-typing")
      socket.off("user-stop-typing")
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const searchUsers = async (value: string) => {
    setQuery(value)

    if (!value) {
      setSearchResults([])
      return
    }

    const res = await axios.get<Conversation[]>(
      `/api/friends/search?q=${value}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    setSearchResults(res.data)
  }

  const startConversation = async (user: Conversation) => {
    const res = await axios.post(
      "/api/conversations/start",
      { userId: user.id },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    const conversation = res.data

    setSelected(conversation)

    setConversations((prev) => {
      const exists = prev.find((c) => c.id === conversation.id)
      return exists ? prev : [conversation, ...prev]
    })

    setSearchResults([])
    setQuery("")
  }

  const sendMessage = () => {
    if (!selected || !newMessage.trim()) return

    socket.emit("send-message", {
      conversationId: selected.id,
      text: newMessage,
    })

    setNewMessage("")
  }

  return (
    <div className="flex h-screen bg-prussian text-white">
      {/* SIDEBAR */}
      <div className="w-80 bg-navy flex flex-col">
        <div className="p-4 text-xl font-semibold border-b border-imperial">
          Messages
        </div>

        <div className="p-3">
          <input
            value={query}
            onChange={(e) => searchUsers(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="w-full bg-[#0A132D] border border-white/10 rounded-lg px-3 py-2 text-white"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {query && searchResults.length > 0 && (
            <>
              <p className="text-xs text-white/40">Résultats</p>
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => startConversation(user)}
                  className="p-3 hover:bg-white/10 rounded-lg cursor-pointer"
                >
                  {user.name}
                </div>
              ))}
            </>
          )}

          {!query &&
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelected(conv)}
                className="p-3 hover:bg-white/10 rounded-lg cursor-pointer"
              >
                {conv.name}
              </div>
            ))}
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((msg) => {
                const isMine = msg.sender_id === currentUserId

                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className="relative">
                      <div className="p-3 bg-[#0A132D] rounded-xl">
                        {msg.text}
                      </div>

                      {isMine && (
                        <div className="flex gap-1 text-xs">
                          <button onClick={() => editMessage(msg)}>✏️</button>
                          <button onClick={() => deleteMessage(msg.id)}>🗑️</button>
                          <button onClick={() => navigator.clipboard.writeText(msg.text)}>📋</button>
                          <button onClick={() => toggleEmojiPicker(msg.id)}>😊</button>
                        </div>
                      )}

                      {emojiPickerOpenFor === msg.id && (
                        <EmojiPicker
                          onEmojiClick={(emoji) =>
                            addEmojiToMessage(msg.id, emoji)
                          }
                        />
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 flex gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 p-2 rounded bg-[#0A132D]"
              />
              <button onClick={sendMessage}>
                <Send />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            Sélectionnez une conversation
          </div>
        )}
      </div>
    </div>
  )
}