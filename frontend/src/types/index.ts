export interface User {
  id: string
  email: string
  username: string
  createdAt?: string | null
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  text: string
  seen: boolean
  createdAt: string
  fromMe?: boolean
  // raw SQL properties
  conversation_id?: string
  sender_id?: string
  created_at?: string
}

export interface Conversation {
  id: string
  name: string | null
  createdAt: string
  updatedAt: string
  userId?: string // used in some context
  lastMessage?: string
  unread?: number
  status?: string
  // raw SQL properties
  last_message?: string
  unread_count?: number
}

export interface ChatMessage extends Message { }
export interface ChatConversation extends Conversation { }

export interface Review {
  id: string
  userId: string
  username: string
  rating: number
  comment: string
  createdAt: string
}

export interface Friend {
  id: string
  username: string
  email: string
}

export interface FriendRequest {
  id: string
  requesterId: string
  requesterUsername: string
  createdAt: string
}

export interface OMDBMovie {
  imdbID: string
  Title: string
  Year: string
  Type: string
  Poster: string
}

export interface OMDBMovieDetail extends OMDBMovie {
  Rated?: string
  Released?: string
  Runtime?: string
  Genre?: string
  Director?: string
  Writer?: string
  Actors?: string
  Plot?: string
  Language?: string
  Country?: string
  Awards?: string
  Ratings?: Array<{ Source: string; Value: string }>
  Metascore?: string
  imdbRating?: string
  imdbVotes?: string
  DVD?: string
  BoxOffice?: string
  Production?: string
  Website?: string
  Response?: string
  Error?: string
}

export interface Film {
  id: string
  title: string
  year?: string | null
  posterUrl?: string | null
  synopsis?: string | null
  metadata?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  categories?: string[] | null
}

export interface Category {
  id: string
  name: string
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ApiRequestOptions extends RequestInit {
  token?: string | null
  auth?: boolean
}

export interface UserStatusPayload {
  userId: string
}
