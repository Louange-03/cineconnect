export type UUID = string

export type User = {
  id: UUID
  email: string
  username: string
  createdAt?: string | null
}

export type AuthResponse = {
  token: string
  user: User
}

export type Film = {
  id: UUID
  imdbId?: string
  title: string
  year?: string | null
  posterUrl?: string | null
  synopsis?: string | null
  metadata?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  categories?: string[] | null
}

export type Category = {
  id: UUID
  name: string
  createdAt?: string | null
  updatedAt?: string | null
}

export type Review = {
  id: UUID
  userId: UUID
  filmId: UUID
  rating: number
  comment?: string | null
  createdAt?: string
}

