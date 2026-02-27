import React, { useState, useEffect, useRef } from "react"
import { useAuth } from "../hooks/useAuth"
import { useInbox, useConversation, useSendMessage } from "../hooks/useMessages"
import { useNavigate } from "@tanstack/react-router"

export function Discussion() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: inbox, isLoading: loadingInbox } = useInbox()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: messages, isLoading: loadingMessages } = useConversation(selectedUserId)
  const sendMut = useSendMessage()

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (user === null) {
    // not yet loaded or not logged in, handled partly by UI
    // Let's redirect if really not logged in, but just show state for now
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-[#050B1C]">
        <div className="text-center bg-white/5 p-10 rounded-3xl border border-white/10 max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Connectez-vous</h2>
          <p className="text-gray-400 mb-6">Vous devez être connecté pour participer aux discussions et échanger des suggestions.</p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] text-white font-bold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(29,108,224,0.3)]"
          >
            Se connecter
          </button>
        </div>
      </div>
    )
  }

  const selectedUser = inbox?.find(i => i.userId === selectedUserId)

  // Function to determine if a message is from the logged-in user
  const isMe = (senderId: string) => senderId === user?.id

  return (
    <div className="h-[85vh] bg-[#050B1C] flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex w-full bg-[#0a1128]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">

        {/* SIDEBAR: INBOX */}
        <div className="w-1/3 min-w-[300px] max-w-[400px] border-r border-white/10 bg-white/5 flex flex-col relative z-10">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="text-3xl">💬</span> Messages
            </h2>
            <button className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1D6CE0] hover:border-transparent transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {loadingInbox ? (
              <div className="flex justify-center p-8">
                <div className="w-8 h-8 border-4 border-white/20 border-t-[#1D6CE0] rounded-full animate-spin"></div>
              </div>
            ) : !inbox || inbox.length === 0 ? (
              <div className="text-center p-8 mt-10">
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl opacity-50">👥</span>
                </div>
                <p className="text-gray-400">Aucune conversation.</p>
                <p className="text-sm text-gray-500 mt-2">Recherchez un ami pour initier l'échange.</p>
              </div>
            ) : (
              inbox.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => setSelectedUserId(conv.userId)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedUserId === conv.userId
                      ? "bg-[#1D6CE0]/10 border-[#1D6CE0]/50 shadow-[0_0_15px_rgba(29,108,224,0.15)]"
                      : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                        {conv.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#0a1128] rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-base truncate ${selectedUserId === conv.userId ? "text-white" : "text-gray-200"}`}>
                        {conv.username}
                      </h3>
                      <p className={`text-sm truncate mt-0.5 ${conv.unreadCount && conv.unreadCount > 0 && selectedUserId !== conv.userId
                          ? "text-white font-semibold"
                          : "text-gray-500"
                        }`}>
                        {conv.lastMessage?.content || "Nouvelle conversation"}
                      </p>
                    </div>
                    {conv.unreadCount && conv.unreadCount > 0 && selectedUserId !== conv.userId && (
                      <div className="w-6 h-6 rounded-full bg-[#1D6CE0] flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(29,108,224,0.5)]">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div className="flex-1 flex flex-col relative z-10 w-full h-full"> {/* Ensure h-full for the main wrapper */}
          {!selectedUserId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-opacity-5">
              <div className="w-24 h-24 mb-6 relative">
                <div className="absolute inset-0 bg-[#1D6CE0] blur-2xl opacity-20 rounded-full animate-pulse"></div>
                <div className="relative w-full h-full bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center shadow-lg transform rotate-[-10deg]">
                  <span className="text-4xl">🍿</span>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Vos Échanges Privés</h2>
              <p className="text-gray-400 max-w-md text-lg">
                Sélectionnez une conversation à gauche pour partager vos meilleures recommandations ou débattre de la dernière sortie.
              </p>
            </div>
          ) : (
            <>
              {/* CHAT HEADER */}
              <div className="h-20 px-8 border-b border-white/10 bg-white/5 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_10px_rgba(0,0,0,0.5)] border border-white/10">
                    {selectedUser?.username?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedUser?.username || "Ami"}</h2>
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      En ligne
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <button className="p-2.5 rounded-full hover:bg-white/10 hover:text-white transition-colors" title="Suggestions de films">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                  </button>
                  <button className="p-2.5 rounded-full hover:bg-white/10 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
                  </button>
                </div>
              </div>

              {/* MESSAGES LIST (must push input down and flex shrink to allow scrolling) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {loadingMessages ? (
                  <div className="flex justify-center p-8">
                    <div className="w-8 h-8 border-4 border-white/20 border-t-[#1D6CE0] rounded-full animate-spin"></div>
                  </div>
                ) : !messages || messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-20 flex flex-col items-center">
                    <span className="text-4xl mb-4 opacity-50">👋</span>
                    Dites bonjour ! C'est le début de votre discussion.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const me = isMe(msg.senderId)
                    return (
                      <div key={msg.id} className={`flex ${me ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-2xl px-5 py-3.5 shadow-md ${me
                            ? "bg-gradient-to-br from-[#1D6CE0] to-[#3EA6FF] text-white rounded-br-sm shadow-[0_5px_15px_rgba(29,108,224,0.3)]"
                            : "bg-white/10 text-gray-100 border border-white/5 rounded-bl-sm"
                          }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          <span className={`text-[10px] block mt-1.5 ${me ? "text-white/70 text-right" : "text-gray-500 text-left"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
                {/* Auto Scroll Dummy Element */}
                <div ref={messagesEndRef} />
              </div>

              {/* MESSAGE INPUT (docked at the bottom) */}
              <div className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-md pb-6 shrink-0 mt-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!draft.trim()) return
                    sendMut.mutate({ receiverId: selectedUserId, content: draft.trim() })
                    setDraft("")
                  }}
                  className="flex gap-4 items-end max-w-5xl mx-auto"
                >
                  <div className="flex-1 relative">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Écrire un message..."
                      className="w-full bg-[#050B1C]/80 border border-white/15 rounded-2xl px-5 py-3.5 pt-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1D6CE0] focus:border-transparent resize-none h-[56px] custom-scrollbar shadow-inner"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          if (draft.trim()) {
                            sendMut.mutate({ receiverId: selectedUserId, content: draft.trim() })
                            setDraft("")
                          }
                        }
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!draft.trim() || sendMut.isPending}
                    className="h-[56px] w-[56px] rounded-2xl bg-[#1D6CE0] hover:bg-[#3EA6FF] flex items-center justify-center text-white disabled:opacity-50 disabled:hover:bg-[#1D6CE0] transition-colors shadow-[0_0_15px_rgba(29,108,224,0.4)] shrink-0"
                  >
                    {sendMut.isPending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1">
                        <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}