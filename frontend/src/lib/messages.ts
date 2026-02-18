const MESSAGES_KEY = "cineconnect.messages.v1"

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
}

function read(): Message[] {
  try {
    return JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]")
  } catch {
    return []
  }
}

function write(data: Message[]): void {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(data))
}

export function getConversations(myId: string) {
  const messages = read()

  const map = new Map<string, { userId: string; lastMessage: string; updatedAt: string }>()

  messages.forEach((m) => {
    const other =
      m.senderId === myId ? m.receiverId : m.senderId

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

export function getMessagesWithUser(myId: string, otherId: string): Message[] {
  return read().filter(
    (m) =>
      (m.senderId === myId && m.receiverId === otherId) ||
      (m.senderId === otherId && m.receiverId === myId)
  )
}

export function sendMessage(myId: string, otherId: string, content: string): Message[] {
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
