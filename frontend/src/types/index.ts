export interface User {
  id: string
  email: string
  username: string
  createdAt?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
}

export interface Conversation {
  userId: string
  lastMessage: string
  updatedAt: string
}

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

// Types pour la base locale (Drizzle)
export interface Film {
  id: string
  title: string
  year?: string
  posterUrl?: string
  synopsis?: string
  metadata?: string
  createdAt?: string
  updatedAt?: string
  categories?: string[]
}

export interface Category {
  id: string
  name: string
  createdAt?: string
  updatedAt?: string
}

export interface ApiRequestOptions extends RequestInit {
  token?: string
  auth?: boolean
}