// src/components/Chat.tsx
import { useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"
import Picker from "emoji-picker-react" // npm install emoji-picker-react
import "../components/Chat.css"
interface Message {
  id: string
  senderId: string
  text: string
  createdAt: string
}

interface ChatProps {
  conversationId: string
  currentUserId: string
}

const socket = io("http://localhost:3001") // mettre ton URL backend

export default function Chat({ conversationId, currentUserId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [showEmoji, setShowEmoji] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Connexion et écoute des événements
  useEffect(() => {
    socket.emit("join_conversation", conversationId)

    socket.on("receive_message", (msg: Message) =>
      setMessages((prev) => [...prev, msg])
    )

    socket.on("message_edited", (updated: Message) =>
      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      )
    )

    socket.on("message_deleted", (id: string) =>
      setMessages((prev) => prev.filter((m) => m.id !== id))
    )

    return () => {
      socket.off("receive_message")
      socket.off("message_edited")
      socket.off("message_deleted")
    }
  }, [conversationId])

  // Envoyer ou modifier un message
  const handleSend = () => {
    if (!text.trim()) return

    if (editingId) {
      socket.emit("edit_message", { messageId: editingId, text })
      setEditingId(null)
    } else {
      socket.emit("send_message", { conversationId, senderId: currentUserId, text })
    }

    setText("")
  }

  const handleEdit = (msg: Message) => {
    setText(msg.text)
    setEditingId(msg.id)
    inputRef.current?.focus()
  }

  const handleDelete = (msgId: string) => {
    socket.emit("delete_message", msgId)
  }

  const handleCopy = (msg: Message) => {
    navigator.clipboard.writeText(msg.text)
    alert("Message copié !")
  }

  const onEmojiClick = (event: any, emojiObject: any) => {
    setText((prev) => prev + emojiObject.emoji)
  }

  return (
    <div className="chat-container">
      <div className="messages" style={{ maxHeight: "400px", overflowY: "auto" }}>
        {messages.map((m) => (
          <div key={m.id} className={m.senderId === currentUserId ? "me" : "other"}>
            <span>{m.text}</span>
            {m.senderId === currentUserId && (
              <span style={{ marginLeft: "10px" }}>
                <button onClick={() => handleEdit(m)}>✏️</button>
                <button onClick={() => handleDelete(m.id)}>🗑️</button>
                <button onClick={() => handleCopy(m)}>📋</button>
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input" style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
        <button onClick={() => setShowEmoji((prev) => !prev)}>😀</button>
        {showEmoji && <Picker onEmojiClick={onEmojiClick} />}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tapez un message..."
          style={{ flex: 1, marginLeft: "5px" }}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} style={{ marginLeft: "5px" }}>
          {editingId ? "Modifier" : "Envoyer"}
        </button>
      </div>
    </div>
  )
}