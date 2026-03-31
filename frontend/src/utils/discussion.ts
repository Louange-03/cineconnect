import type { Message } from "../types"

export const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"] as const

export function parseSharedFilmMessage(text: string): { title: string; year: string; url: string; posterUrl?: string } | null {
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
  return { title: match[1].trim(), year: match[2].trim(), url, posterUrl: posterUrl && /^https?:\/\//i.test(posterUrl) ? posterUrl : undefined }
}

export function formatMessageTime(value?: string) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

export function truncateReplySnippet(text: string, max = 90): string {
  const t = text.trim().replace(/\s+/g, " ")
  return t.length <= max ? t : `${t.slice(0, max)}…`
}

export function replyQuoteSummary(msg: Message, currentUserId: string | null): { author: string; snippet: string; replyId: string } | null {
  const replyId = msg.reply_to_id
  if (!replyId) return null
  const raw = msg.reply_to_text
  if (raw == null || raw === "") return { author: "Message", snippet: "…", replyId }
  const film = parseSharedFilmMessage(raw)
  const snippet = film ? `${film.title} (${film.year || "—"})` : truncateReplySnippet(raw)
  const sid = msg.reply_to_sender_id
  const author = sid && currentUserId && sid === currentUserId ? "Toi" : msg.reply_to_sender_username || "Message"
  return { author, snippet, replyId }
}

export function formatMessageDayLabel(value?: string) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  const now = new Date()
  const sameDay = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  if (sameDay) return "Aujourd'hui"
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear()
  if (isYesterday) return "Hier"
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
}
