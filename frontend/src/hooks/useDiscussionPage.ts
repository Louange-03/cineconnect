import { useEffect, useState } from "react"
import type { Conversation, Message } from "../types"
import { getUser } from "../lib/auth"
import { connectSocket, disconnectSocket, socket } from "../socket"
import { fetchConversations, fetchMessages, fetchShareFilms, type ShareFilmItem } from "../services/discussion.service"

interface UserStatusPayload {
  userId: string
}

type ReactionPayload = {
  conversationId: string
  messageId: string
  emoji: string
  userId: string
}

type MessageReactions = Record<string, { emoji: string; users: string[] }[]>

export function useDiscussionPage() {
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
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)

  const currentUserId = getUser()?.id ?? null
  const selectedConversationId = selected?.id ?? null

  const handleSelectConversation = (conv: Conversation) => {
    setSelected(conv)
    socket.emit("join-conversation", { conversationId: conv.id })
    setConversations((prev) => prev.map((item) => (item.id === conv.id ? { ...item, unread_count: 0 } : item)))
  }

  useEffect(() => {
    connectSocket()
    void fetchConversations().then(setConversations)
    return () => disconnectSocket()
  }, [])

  useEffect(() => {
    if (!selected) return
    socket.emit("join-conversation", { conversationId: selected.id })
    void fetchMessages(selected.id).then(setMessages)
    socket.emit("mark-as-seen", { conversationId: selected.id })
    setConversations((prev) => prev.map((conv) => (conv.id === selected.id ? { ...conv, unread_count: 0 } : conv)))
    setReactionOpenFor(null)
    setReactionsByMessage({})
    setReplyingTo(null)
  }, [selected])

  useEffect(() => {
    socket.on("new-message", (message: Message) => {
      const conversationId = message.conversation_id || message.conversationId
      const senderId = message.sender_id || message.senderId
      if (!conversationId) return
      const isCurrentConversation = selectedConversationId === conversationId
      const isIncoming = Boolean(senderId && senderId !== currentUserId)
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id !== conversationId) return conv
          const nextUnread = isIncoming && !isCurrentConversation ? (conv.unread_count ?? 0) + 1 : 0
          return { ...conv, last_message: message.text || "", unread_count: nextUnread }
        })
        const idx = updated.findIndex((conv) => conv.id === conversationId)
        if (idx <= 0) return updated
        const [hit] = updated.splice(idx, 1)
        updated.unshift(hit)
        return updated
      })
      if (isCurrentConversation) {
        setMessages((prev) => [...prev, message])
        if (isIncoming) socket.emit("mark-as-seen", { conversationId })
      }
    })

    socket.on("user-typing", (data: UserStatusPayload) => {
      setTypingUsers((prev) => (prev.includes(data.userId) ? prev : [...prev, data.userId]))
    })
    socket.on("user-stop-typing", (data: UserStatusPayload) => {
      setTypingUsers((prev) => prev.filter((id) => id !== data.userId))
    })
    socket.on("messages-seen", ({ conversationId }: { conversationId?: string }) => {
      setMessages((prev) => prev.map((m) => (m.sender_id === currentUserId ? { ...m, seen: true } : m)))
      if (!conversationId) return
      setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, unread_count: 0 } : conv)))
    })
    socket.on("message-reaction", (payload: ReactionPayload) => {
      setReactionsByMessage((prev) => {
        const current = [...(prev[payload.messageId] ?? [])]
        for (const bucket of current) bucket.users = bucket.users.filter((id) => id !== payload.userId)
        const cleaned = current.filter((b) => b.users.length > 0)
        const hasSame = (prev[payload.messageId] ?? []).some((b) => b.emoji === payload.emoji && b.users.includes(payload.userId))
        if (hasSame) return { ...prev, [payload.messageId]: cleaned }
        const sameEmoji = cleaned.find((b) => b.emoji === payload.emoji)
        if (sameEmoji) sameEmoji.users.push(payload.userId)
        else cleaned.push({ emoji: payload.emoji, users: [payload.userId] })
        return { ...prev, [payload.messageId]: cleaned }
      })
    })
    return () => {
      socket.off("new-message")
      socket.off("user-typing")
      socket.off("user-stop-typing")
      socket.off("messages-seen")
      socket.off("message-reaction")
    }
  }, [currentUserId, selectedConversationId])

  const sendMessage = () => {
    if (!selected || !newMessage.trim()) return
    socket.emit("send-message", { conversationId: selected.id, text: newMessage, replyToMessageId: replyingTo?.id })
    setNewMessage("")
    setReplyingTo(null)
  }

  const handleTyping = () => {
    if (selected) socket.emit("typing", { conversationId: selected.id })
  }
  const handleStopTyping = () => {
    if (selected) socket.emit("stop-typing", { conversationId: selected.id })
  }

  const openShareFilms = async () => {
    if (!selected) return
    setShareOpen(true)
    setFilmSearch("")
    if (films.length > 0) return
    setLoadingFilms(true)
    try {
      setFilms(await fetchShareFilms())
    } finally {
      setLoadingFilms(false)
    }
  }

  const shareFilmInCurrentChat = (film: ShareFilmItem) => {
    if (!selected) return
    const filmUrl = `${window.location.origin}/film/${film.id}`
    const poster = film.posterUrl || film.poster_url
    const text = `Je te partage ce film: ${film.title} (${film.year || "—"})\n${poster ? `POSTER:${poster}\n` : ""}${filmUrl}`
    socket.emit("send-message", { conversationId: selected.id, text, replyToMessageId: replyingTo?.id })
    setShareOpen(false)
    setReplyingTo(null)
  }

  const reactToMessage = (messageId: string, emoji: string) => {
    if (!selected) return
    socket.emit("message-reaction", { conversationId: selected.id, messageId, emoji })
    setReactionOpenFor(null)
  }

  const filteredConversations = conversations.filter((conv) => (conv.name || "Inconnu").toLowerCase().includes(search.trim().toLowerCase()))
  const filteredFilms = films.filter((f) => f.title.toLowerCase().includes(filmSearch.trim().toLowerCase()))

  return {
    conversations,
    selected,
    setSelected,
    messages,
    newMessage,
    setNewMessage,
    search,
    setSearch,
    typingUsers,
    shareOpen,
    setShareOpen,
    filmSearch,
    setFilmSearch,
    loadingFilms,
    reactionOpenFor,
    setReactionOpenFor,
    reactionsByMessage,
    replyingTo,
    setReplyingTo,
    currentUserId,
    handleSelectConversation,
    sendMessage,
    handleTyping,
    handleStopTyping,
    openShareFilms,
    shareFilmInCurrentChat,
    reactToMessage,
    filteredConversations,
    filteredFilms,
  }
}
