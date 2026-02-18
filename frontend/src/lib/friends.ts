// simple client‑side mock storage functions

const USERS_KEY = "cineconnect.users.v1"
const FRIENDS_KEY = "cineconnect.friends.v1"

function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

// ---------- TYPES ----------
export interface UserItem {
  id: string
  username: string
  email: string
}

export type FriendRelation = {
  id: string
  userId: string
  friendId: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
}

// ---------- USERS (mock) ----------
export function seedUsersIfEmpty(): UserItem[] {
  const users = read<UserItem[]>(USERS_KEY, [])
  if (users.length > 0) return users

  const seeded: UserItem[] = [
    { id: "u_1", username: "demo", email: "demo@cineconnect.dev" },
    { id: "u_2", username: "sarah", email: "sarah@cineconnect.dev" },
    { id: "u_3", username: "amine", email: "amine@cineconnect.dev" },
    { id: "u_4", username: "lina", email: "lina@cineconnect.dev" },
    { id: "u_5", username: "tom", email: "tom@cineconnect.dev" },
  ]
  write(USERS_KEY, seeded)
  return seeded
}

export function getAllUsers(): UserItem[] {
  return read<UserItem[]>(USERS_KEY, [])
}

export function searchUsers(q?: string): UserItem[] {
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
export function getFriendRelations(): FriendRelation[] {
  return read<FriendRelation[]>(FRIENDS_KEY, [])
}

function setFriendRelations(next: FriendRelation[]): void {
  write(FRIENDS_KEY, next)
}

export function getMyFriends(userId: string): FriendRelation[] {
  const rel = getFriendRelations()
  const accepted = rel.filter((r) => r.status === "accepted")
  return accepted.filter(
    (r) => r.userId === userId || r.friendId === userId
  )
}

export function getMyRequests(userId: string): FriendRelation[] {
  const rel = getFriendRelations()
  return rel.filter((r) => r.status === "pending" && r.friendId === userId)
}

export function sendFriendRequest(userId: string, targetUserId: string): FriendRelation[] {
  const rel = getFriendRelations()

  const exists = rel.find(
    (r) =>
      (r.userId === userId && r.friendId === targetUserId) ||
      (r.userId === targetUserId && r.friendId === userId)
  )
  if (exists) return rel

  const next: FriendRelation[] = [
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

export function acceptRequest(myId: string, requesterId: string): FriendRelation[] {
  const rel = getFriendRelations()

  const next: FriendRelation[] = rel.map((r) => {
    if (
      r.status === "pending" &&
      r.userId === requesterId &&
      r.friendId === myId
    ) {
      return { ...r, status: "accepted" } as FriendRelation
    }
    return r
  })

  setFriendRelations(next)
  return next
}

export function rejectRequest(myId: string, requesterId: string): FriendRelation[] {
  const rel = getFriendRelations()

  const next: FriendRelation[] = rel.map((r) => {
    if (
      r.status === "pending" &&
      r.userId === requesterId &&
      r.friendId === myId
    ) {
      return { ...r, status: "rejected" } as FriendRelation
    }
    return r
  })

  setFriendRelations(next)
  return next
}

export function removeFriendRelation(myId: string, otherId: string): FriendRelation[] {
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
