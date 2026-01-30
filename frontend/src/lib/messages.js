const MESSAGES_KEY = "cineconnect.messages.v1"

function read() {
  try {
    return JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]")
  } catch {
    return []
  }
}

function write(data) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(data))
}

export function getConversations(myId) {
  const messages = read()

  const map = new Map()

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
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  )
}

export function getMessagesWithUser(myId, otherId) {
  return read().filter(
    (m) =>
      (m.senderId === myId && m.receiverId === otherId) ||
      (m.senderId === otherId && m.receiverId === myId)
  )
}

export function sendMessage(myId, otherId, content) {
  const next = [
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
