
import React, { useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import { ChatConversation, ChatMessage } from "../../types"

interface Props {
  conversation: ChatConversation | null
  socket: Socket
}

const ChatWindow: React.FC<Props> = ({ conversation, socket }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")

  useEffect(() => {
    if (!conversation) return

    fetch(`/api/conversations/${conversation.id}/messages`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt")}`
      }
    })
      .then(res => res.json())
      .then((data: ChatMessage[]) => setMessages(data))

    socket.emit("read_messages", { conversationId: conversation.id })
  }, [conversation, socket])

  useEffect(() => {
    socket.on("new_message", (msg: ChatMessage) => {
      if (conversation?.id === msg.conversationId) {
        setMessages(prev => [...prev, msg])
      }
    })

    return () => {
      socket.off("new_message")
    }
  }, [conversation, socket])

  const sendMessage = () => {
    if (!input.trim() || !conversation) return

    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      senderId: 1,
      content: input,
      createdAt: new Date().toISOString(),
      fromMe: true
    }

    socket.emit("send_message", newMsg)
    setMessages(prev => [...prev, newMsg])
    setInput("")
  }

  if (!conversation)
    return <div className="flex-1 bg-prussian-blue p-4">Select a conversation</div>

  return (
    <div className="flex-1 flex flex-col bg-prussian-blue">
      <div className="p-4 border-b border-imperial-blue">
        <h2>{conversation.name}</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`my-2 p-2 rounded max-w-xs ${
              msg.fromMe
                ? "bg-frosted-blue self-end"
                : "bg-cornflower-ocean self-start"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="p-4 flex border-t border-imperial-blue">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 p-2 rounded bg-frosted-blue text-deep-navy mr-2"
        />
        <button
          onClick={sendMessage}
          className="bg-imperial-blue text-frosted-blue px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatWindow