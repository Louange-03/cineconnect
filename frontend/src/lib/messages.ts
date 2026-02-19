import type { Message, Conversation } from "../types"

const MESSAGES_KEY = "cineconnect.messages.v1"

function read(): Message[] {
  try {
    return JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]")
  } catch {
    return []
  }
}

function write(data: Message[]) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(data))
}

export function getConversations(myId: number): Conversation[] {
  const messages = read()

  const map = new Map<number, Conversation>()

  messages.forEach((m) => {
    const other = m.senderId === myId ? m.receiverId : m.senderId

    if (!map.has(other)) {
      map.set(other, {
        userId: other,
        lastMessage: m.content,
        updatedAt: m.createdAt,
      })
    }
  })

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export function getMessagesWithUser(myId: number, otherId: number): Message[] {
  return read().filter(
    (m) =>
      (m.senderId === myId && m.receiverId === otherId) ||
      (m.senderId === otherId && m.receiverId === myId)
  )
}

export function sendMessage(myId: number, otherId: number, content: string): Message[] {
  const next: Message[] = [
    ...read(),
    {
      id: crypto.randomUUID(),
      senderId: myId,
      receiverId: otherId,
      content,
      createdAt: new Date().toISOString(),
    },
  ]

  write(next)
  return next
}
