import { useEffect, useState } from "react"
import { Send } from "lucide-react"
import { socket } from "../socket"
import axios from "axios"
import type { Conversation, Message } from "../types"
import { getToken, getUser } from "../lib/auth"
import { useSearch } from "@tanstack/react-router"

interface UserStatusPayload {
  userId: string
}

export function Discussion() {
  const search = useSearch({ from: "/discussion" }) as { userId?: string }
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  const token = getToken()
  const currentUserId = getUser()?.id

  useEffect(() => {
    if (!token) return
    socket.auth = { token }
    socket.connect()
    return () => {
      socket.disconnect()
    }
  }, [token])

  useEffect(() => {
    const fetchConversations = async () => {
      const res = await axios.get<Conversation[]>(
        "http://localhost:3001/api/conversations",
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setConversations(res.data)
    }

    fetchConversations()
  }, [token])

  useEffect(() => {
    if (!token || !search.userId) return
    const startConversation = async () => {
      try {
        await axios.post(
          "http://localhost:3001/api/messages/start",
          { userId: search.userId },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } catch (e) {
        console.error("Impossible de démarrer la conversation", e)
      }
    }
    startConversation()
  }, [token, search.userId])

  useEffect(() => {
    if (!selected) return

    const fetchMessages = async () => {
      const res = await axios.get<Message[]>(
        `http://localhost:3001/api/conversations/${selected.id}/messages`,
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
    <div className="flex h-[calc(100vh-5rem)] mt-20 bg-[#050B1C] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-full max-w-[320px] md:max-w-[380px] flex flex-col border-r border-white/10 bg-[#0A132D]/60 backdrop-blur-xl">
        <div className="p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-2xl font-black tracking-tight text-white">Messages</h2>
          <p className="text-sm text-gray-400 mt-1">Vos conversations récentes</p>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-2">
          {conversations.map((conv) => {
            const isSelected = selected?.id === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => setSelected(conv)}
                className={`p-4 cursor-pointer flex justify-between items-center rounded-2xl transition-all duration-300 border ${isSelected
                  ? "bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] border-transparent shadow-[0_0_20px_rgba(29,108,224,0.3)]"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold shadow-inner ${isSelected ? "bg-white/20 text-white" : "bg-[#1D6CE0]/20 text-[#3EA6FF]"
                    }`}>
                    {(conv.name || "Inconnu").charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className={`font-bold truncate ${isSelected ? "text-white" : "text-white/90"}`}>{conv.name || "Inconnu"}</p>
                    <p className={`text-sm truncate ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                      {conv.last_message || "Aucun message"}
                    </p>
                  </div>
                </div>

                {(conv.unread_count ?? 0) > 0 && (
                  <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                    {conv.unread_count}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#050B1C] relative">
        {/* Background gradient & texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1D6CE0]/5 via-transparent to-[#3EA6FF]/5 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none" />

        {selected ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-white/10 bg-[#0A132D]/80 backdrop-blur-md flex items-center gap-4 z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1D6CE0] to-[#3EA6FF] text-lg font-bold shadow-[0_0_15px_rgba(29,108,224,0.4)]">
                {(selected.name || "Inconnu").charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">{selected.name || "Inconnu"}</h3>
                <p className="text-sm text-[#3EA6FF] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  En ligne
                </p>
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 z-10 hide-scrollbar scroll-smooth">
              {messages.map((msg) => {
                const isMine = msg.sender_id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"} motion-safe:animate-fade-in`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-3xl ${isMine
                        ? "bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] text-white rounded-br-sm shadow-[0_5px_20px_rgba(29,108,224,0.3)]"
                        : "bg-[#0A132D] border border-white/10 text-white/90 rounded-bl-sm shadow-xl"
                        }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>

                      {isMine && msg.seen && (
                        <div className="text-[10px] mt-2 text-white/70 text-right font-medium flex justify-end gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white/90">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-[#0A132D] border border-white/10 text-white/60 text-sm px-5 py-3 rounded-full flex items-center gap-2 shadow-sm">
                    En train d’écrire
                    <span className="flex gap-1 mt-1">
                      <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="p-4 bg-transparent z-10 mb-2">
              <div className="mx-auto max-w-4xl bg-[#0A132D]/90 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center p-2 pr-3 gap-3">
                <div className="relative flex-1">
                  <input
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onBlur={handleStopTyping}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="w-full bg-transparent border-none py-3 pl-6 pr-12 text-white placeholder-white/40 focus:outline-none focus:ring-0 transition-all"
                    placeholder="Écrivez votre message..."
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-[#3EA6FF] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm3.675 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] h-10 w-10 rounded-full text-white shadow-[0_0_15px_rgba(29,108,224,0.4)] transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center shrink-0"
                  aria-label="Envoyer"
                >
                  <Send size={18} className="ml-0.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/40 space-y-4">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <p className="text-xl font-medium">Vos Messages</p>
            <p className="text-sm">Sélectionnez une conversation pour commencer à discuter</p>
          </div>
        )}
      </div>
    </div>
  )
}