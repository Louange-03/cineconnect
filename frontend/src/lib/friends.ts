import type { Friend, FriendRequest } from "../types"

const USERS_KEY = "cineconnect.users.v1"
const FRIENDS_KEY = "cineconnect.friends.v1"

function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
  } catch {
    return fallback
  }
}

function write(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value))
}

// ---------- USERS (mock) ----------
export function seedUsersIfEmpty() {
  const users = read(USERS_KEY, []) as Friend[]
  if (users.length > 0) return users

  const seeded: Friend[] = [
    { id: 1, username: "demo", email: "demo@cineconnect.dev" },
    { id: 2, username: "sarah", email: "sarah@cineconnect.dev" },
    { id: 3, username: "amine", email: "amine@cineconnect.dev" },
    { id: 4, username: "lina", email: "lina@cineconnect.dev" },
    { id: 5, username: "tom", email: "tom@cineconnect.dev" },
  ]
  write(USERS_KEY, seeded)
  return seeded
}

export function getAllUsers() {
  return read<Friend[]>(USERS_KEY, [])
}

export function searchUsers(q: string) {
  const users = getAllUsers()
  const query = (q || "").trim().toLowerCase()
  if (!query) return users

  return users.filter(
    (u) =>
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
  )
}

// ---------- FRIEND RELATIONS (mock) ----------
// relation: { id, userId, friendId, status, createdAt }
// status: pending | accepted | rejected

interface Relation {
  id: string
  userId: number
  friendId: number
  status: string
  createdAt: string
}

export function getFriendRelations(): Relation[] {
  return read<Relation[]>(FRIENDS_KEY, [])
}

function setFriendRelations(next: Relation[]) {
  write(FRIENDS_KEY, next)
}

export function getMyFriends(userId: number): Relation[] {
  const rel = getFriendRelations()
  const accepted = rel.filter((r) => r.status === "accepted")
  return accepted.filter((r) => r.userId === userId || r.friendId === userId)
}

export function getMyRequests(userId: number): Relation[] {
  const rel = getFriendRelations()
  return rel.filter((r) => r.status === "pending" && r.friendId === userId)
}

export function sendFriendRequest(userId: number, targetUserId: number) {
  const rel = getFriendRelations()

  // éviter doublons (dans les 2 sens)
  const exists = rel.find(
    (r) =>
      (r.userId === userId && r.friendId === targetUserId) ||
      (r.userId === targetUserId && r.friendId === userId)
  )
  if (exists) return rel

  const next: Relation[] = [
    {
      id: crypto.randomUUID(),
      userId,
      friendId: targetUserId,
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    ...rel,
  ]
  setFriendRelations(next)
  return next
}

export function acceptRequest(myId: number, requesterId: number) {
  const rel = getFriendRelations()

  const next = rel.map((r) => {
    if (
      r.status === "pending" &&
      r.userId === requesterId &&
      r.friendId === myId
    ) {
      return { ...r, status: "accepted" }
    }
    return r
  })

  setFriendRelations(next)
  return next
}

export function rejectRequest(myId: number, requesterId: number) {
  const rel = getFriendRelations()

  const next = rel.map((r) => {
    if (
      r.status === "pending" &&
      r.userId === requesterId &&
      r.friendId === myId
    ) {
      return { ...r, status: "rejected" }
    }
    return r
  })

  setFriendRelations(next)
  return next
}

export function removeFriendRelation(myId: number, otherId: number) {
  const rel = getFriendRelations()

  const next = rel.filter(
    (r) =>
      !(
        (r.userId === myId && r.friendId === otherId) ||
        (r.userId === otherId && r.friendId === myId)
      )
  )

  setFriendRelations(next)
  return next
}
