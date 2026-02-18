export interface User {
  id: string
  email: string
  username: string
  passwordHash: string
  createdAt: Date
}

export interface SafeUser {
  id: string
  email: string
  username: string
  /** optional timestamp */
  createdAt?: Date
}

export interface JwtPayload {
  id: string
  email: string
  username: string
  createdAt?: Date
}

export interface Friendship {
  id: string
  requesterId: string
  addresseeId: string
  status: "pending" | "accepted" | "rejected"
  createdAt: Date
  updatedAt: Date
}

export interface FriendData {
  id: string
  username: string
  createdAt: Date
}

export interface FriendRequestData {
  friendshipId: string
  fromUserId: string
  fromUsername: string
  createdAt: Date
}
