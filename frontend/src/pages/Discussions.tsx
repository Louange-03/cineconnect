import { useEffect, useState } from "react"
import { Send } from "lucide-react"
import { connectSocket, disconnectSocket, socket } from "../socket"
import axios from "axios"
import type { Conversation, Message } from "../types"
import { getToken, getUser } from "../lib/auth"

interface UserStatusPayload {
  userId: string
}

type ShareFilmItem = {
  id: string
  title: string
  year?: string | null
  posterUrl?: string | null
  poster_url?: string | null
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"] as const

type ReactionPayload = {
  conversationId: string
  messageId: string
  emoji: string
  userId: string
}

type MessageReactions = Record<
  string,
  {
    emoji: string
    users: string[]
  }[]
>

function parseSharedFilmMessage(text: string): { title: string; year: string; url: string; posterUrl?: string } | null {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return null
  const first = lines[0]
  const url = lines[lines.length - 1]
  if (!first.startsWith("Je te partage ce film:")) return null
  if (!/^https?:\/\//i.test(url)) return null

  const payload = first.replace("Je te partage ce film:", "").trim()
  const match = payload.match(/^(.*)\s\((.*)\)$/)
  if (!match) return null
  const posterLine = lines.find((l) => l.startsWith("POSTER:"))
  const posterUrl = posterLine?.replace("POSTER:", "").trim()
  return {
    title: match[1].trim(),
    year: match[2].trim(),
    url,
    posterUrl: posterUrl && /^https?:\/\//i.test(posterUrl) ? posterUrl : undefined,
  }
}

function formatMessageTime(value?: string) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatMessageDayLabel(value?: string) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""

  const now = new Date()
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  if (sameDay) return "Aujourd'hui"

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  if (isYesterday) return "Hier"

  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function Avatar({
  name,
  src,
  selected = false,
  size = "md",
}: {
  name: string | null | undefined
  src?: string | null
  selected?: boolean
  size?: "sm" | "md"
}) {
  const [broken, setBroken] = useState(false)
  const initial = (name || "Inconnu").charAt(0).toUpperCase()
  const baseSize = size === "sm" ? "h-10 w-10" : "h-12 w-12"

  if (!src || broken) {
    return (
      <div
        className={`flex ${baseSize} shrink-0 items-center justify-center rounded-full text-lg font-bold shadow-inner ${
          selected ? "bg-white/20 text-white" : "bg-[#1D6CE0]/20 text-[#3EA6FF]"
        }`}
      >
        {initial}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name || "Utilisateur"}
      className={`${baseSize} shrink-0 rounded-full object-cover ring-1 ${
        selected ? "ring-white/40" : "ring-white/15"
      }`}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
    />
  )
}

export function Discussion() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [search, setSearch] = useState("")
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [shareOpen, setShareOpen] = useState(false)
  const [films, setFilms] = useState<ShareFilmItem[]>([])
  const [filmSearch, setFilmSearch] = useState("")
  const [loadingFilms, setLoadingFilms] = useState(false)
  const [reactionOpenFor, setReactionOpenFor] = useState<string | null>(null)
  const [reactionsByMessage, setReactionsByMessage] = useState<MessageReactions>({})

  const token = getToken()
  const currentUserId = getUser()?.id ?? null

  useEffect(() => {
    connectSocket()
    return () => {
      disconnectSocket()
    }
  }, [])

  useEffect(() => {
    const fetchConversations = async () => {
      const res = await axios.get<Conversation[]>(
        "/api/conversations",
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
        `/api/conversations/${selected.id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessages(res.data)
    }

    fetchMessages()

    socket.emit("mark-as-seen", { conversationId: selected.id })
    setReactionOpenFor(null)
    setReactionsByMessage({})
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

    socket.on("message-reaction", (payload: ReactionPayload) => {
      setReactionsByMessage((prev) => {
        const current = [...(prev[payload.messageId] ?? [])]

        // One reaction per user per message: remove user from all buckets first.
        for (const bucket of current) {
          bucket.users = bucket.users.filter((id) => id !== payload.userId)
        }

        // Remove empty buckets
        const cleaned = current.filter((b) => b.users.length > 0)

        // Toggle off if same reaction already selected by user
        const hasSame =
          (prev[payload.messageId] ?? []).some(
            (b) => b.emoji === payload.emoji && b.users.includes(payload.userId)
          )
        if (hasSame) {
          return { ...prev, [payload.messageId]: cleaned }
        }

        const sameEmoji = cleaned.find((b) => b.emoji === payload.emoji)
        if (sameEmoji) {
          sameEmoji.users.push(payload.userId)
        } else {
          cleaned.push({ emoji: payload.emoji, users: [payload.userId] })
        }

        return { ...prev, [payload.messageId]: cleaned }
      })
    })

    return () => {
      socket.off("new-message")
      socket.off("user-online")
      socket.off("user-offline")
      socket.off("user-typing")
      socket.off("user-stop-typing")
      socket.off("messages-seen")
      socket.off("message-reaction")
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

  const openShareFilms = async () => {
    if (!selected) return
    setShareOpen(true)
    setFilmSearch("")
    if (films.length > 0) return

    const token = getToken()
    if (!token) return

    setLoadingFilms(true)
    try {
      const res = await fetch("/api/films?limit=120", {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Erreur chargement films")
      const data = (await res.json()) as { films?: ShareFilmItem[] }
      setFilms(Array.isArray(data.films) ? data.films : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingFilms(false)
    }
  }

  const shareFilmInCurrentChat = (film: ShareFilmItem) => {
    if (!selected) return
    const filmUrl = `${window.location.origin}/film/${film.id}`
    const poster = film.posterUrl || film.poster_url
    const text = `Je te partage ce film: ${film.title} (${film.year || "—"})\n${poster ? `POSTER:${poster}\n` : ""}${filmUrl}`
    socket.emit("send-message", {
      conversationId: selected.id,
      text,
    })
    setShareOpen(false)
  }

  const reactToMessage = (messageId: string, emoji: string) => {
    if (!selected) return
    socket.emit("message-reaction", {
      conversationId: selected.id,
      messageId,
      emoji,
    })
    setReactionOpenFor(null)
  }

  const normalizedSearch = search.trim().toLowerCase()
  const filteredConversations = conversations.filter((conv) =>
    (conv.name || "Inconnu").toLowerCase().includes(normalizedSearch)
  )
  const filteredFilms = films.filter((f) =>
    f.title.toLowerCase().includes(filmSearch.trim().toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh-5rem)] mt-20 bg-[#050B1C] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-full max-w-[320px] md:max-w-[380px] flex flex-col border-r border-white/10 bg-[#0A132D]/60 backdrop-blur-xl">
        <div className="p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-2xl font-black tracking-tight text-white">Messages</h2>
          <p className="text-sm text-gray-400 mt-1">Vos conversations récentes</p>
          <div className="mt-4 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un ami..."
              className="w-full rounded-xl border border-white/10 bg-[#050B1C]/70 py-2.5 pl-10 pr-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-[#3EA6FF]/60 focus:ring-2 focus:ring-[#3EA6FF]/25"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
              Aucun ami ne correspond a ta recherche.
            </div>
          ) : (
            filteredConversations.map((conv) => {
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
                  <Avatar name={conv.name} src={conv.avatar_url} selected={isSelected} />
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
            })
          )}
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
              <Avatar name={selected.name} src={selected.avatar_url} selected size="md" />
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
              {messages.map((msg, idx) => {
                const isMine = msg.sender_id === currentUserId;
                const sharedFilm = parseSharedFilmMessage(msg.text || "")
                const rawDate = msg.created_at || msg.createdAt
                const sentAt = formatMessageTime(rawDate)
                const dayLabel = formatMessageDayLabel(rawDate)
                const msgReactions = reactionsByMessage[msg.id] ?? []
                const prevRawDate =
                  idx > 0 ? messages[idx - 1].created_at || messages[idx - 1].createdAt : undefined
                const prevDayLabel = idx > 0 ? formatMessageDayLabel(prevRawDate) : ""
                const showDaySeparator = idx === 0 || dayLabel !== prevDayLabel
                return (
                  <div key={msg.id}>
                    {showDaySeparator ? (
                      <div className="my-2 flex items-center justify-center">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70">
                          {dayLabel}
                        </span>
                      </div>
                    ) : null}
                    <div
                      className={`flex ${isMine ? "justify-end" : "justify-start"} motion-safe:animate-fade-in`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-3xl ${isMine
                          ? "bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] text-white rounded-br-sm shadow-[0_5px_20px_rgba(29,108,224,0.3)]"
                          : "bg-[#0A132D] border border-white/10 text-white/90 rounded-bl-sm shadow-xl"
                          }`}
                      >
                        {sharedFilm ? (
                          <a
                            href={sharedFilm.url}
                            target="_blank"
                            rel="noreferrer"
                            className={[
                              "block rounded-2xl border px-4 py-3 transition",
                              isMine
                                ? "border-white/30 bg-white/10 hover:bg-white/15"
                                : "border-white/15 bg-white/5 hover:bg-white/10",
                            ].join(" ")}
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                              Film partage
                            </p>
                            {sharedFilm.posterUrl ? (
                              <img
                                src={sharedFilm.posterUrl}
                                alt={sharedFilm.title}
                                className="mt-2 h-36 w-24 rounded-lg object-cover shadow-lg"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                              />
                            ) : null}
                            <p className="mt-1 text-sm font-bold text-white">{sharedFilm.title}</p>
                            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 px-2.5 py-1 text-[11px] font-medium text-white/85">
                              <span>{sharedFilm.year || "—"}</span>
                              <span>•</span>
                              <span>Ouvrir</span>
                            </div>
                          </a>
                        ) : (
                          <p className="leading-relaxed">{msg.text}</p>
                        )}

                        <div className="mt-2 flex items-center justify-end gap-2 text-[10px] font-medium text-white/70">
                          {sentAt ? <span>{sentAt}</span> : null}
                          {isMine ? (
                            <span className="inline-flex items-center gap-1">
                              {msg.seen ? (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-white/90">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                  </svg>
                                  <span>Vu</span>
                                </>
                              ) : (
                                <span>Envoye</span>
                              )}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setReactionOpenFor((cur) => (cur === msg.id ? null : msg.id))
                              }
                              className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[11px] text-white/80 transition hover:bg-white/10"
                              title="Reagir"
                            >
                              🙂 React
                            </button>
                            {reactionOpenFor === msg.id ? (
                              <div className="absolute bottom-8 left-0 z-20 flex gap-1 rounded-xl border border-white/10 bg-[#0A132D] p-1.5 shadow-2xl">
                                {REACTION_EMOJIS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => reactToMessage(msg.id, emoji)}
                                    className="rounded-md px-1.5 py-1 text-base transition hover:bg-white/10"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          {msgReactions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {msgReactions.map((r) => (
                                <button
                                  key={`${msg.id}-${r.emoji}`}
                                  type="button"
                                  onClick={() => reactToMessage(msg.id, r.emoji)}
                                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] text-white/85 transition hover:bg-white/10"
                                  title="Changer ma reaction"
                                >
                                  <span>{r.emoji}</span>
                                  <span>{r.users.length}</span>
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
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
                <button
                  type="button"
                  onClick={openShareFilms}
                  className="ml-1 flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/85 transition hover:bg-white/10"
                  title="Partager un film"
                >
                  Partager
                </button>
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

            {shareOpen && (
              <div className="px-4 pb-3">
                <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#0A132D]/95 p-3 shadow-2xl">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Partager un film dans cette discussion</p>
                    <button
                      type="button"
                      onClick={() => setShareOpen(false)}
                      className="rounded px-2 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      Fermer
                    </button>
                  </div>
                  <input
                    value={filmSearch}
                    onChange={(e) => setFilmSearch(e.target.value)}
                    placeholder="Rechercher un film..."
                    className="mb-2 w-full rounded-lg border border-white/10 bg-[#050B1C]/70 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-[#3EA6FF]/60"
                  />
                  <div className="max-h-52 space-y-1 overflow-y-auto">
                    {loadingFilms ? (
                      <p className="py-3 text-center text-xs text-white/60">Chargement des films...</p>
                    ) : filteredFilms.length === 0 ? (
                      <p className="py-3 text-center text-xs text-white/60">Aucun film trouvé.</p>
                    ) : (
                      filteredFilms.map((film) => (
                        <button
                          key={film.id}
                          type="button"
                          onClick={() => shareFilmInCurrentChat(film)}
                          className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:bg-white/10"
                        >
                          <span className="text-sm font-medium text-white">{film.title}</span>
                          <span className="text-xs text-white/60">{film.year || "—"}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
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