export interface User {
  id: number
  email: string
  username: string
  createdAt?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Review {
  id: string
  userId: number
  username: string
  rating: number
  comment: string
  createdAt: string
}

export interface Friend {
  id: number
  username: string
  email: string
}

export interface FriendRequest {
  id: number
  requesterId: number
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

export interface ApiRequestOptions extends RequestInit {
  token?: string
  auth?: boolean
}

export interface ChatConversation {
  id: string          
  name: string        
  lastMessage: string
  unread: number      
  status?: string     
}
export interface ChatMessage {
  id: string
  conversationId: string
  senderId: number
  content: string
  fromMe?: boolean     
  createdAt: string
}
 export interface Conversation {
  id: string
  name: string
  last_message: string
  unread_count: number
}

 export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  text: string
  seen: boolean
  created_at: string
}

 export interface UserStatusPayload {
  userId: string
}