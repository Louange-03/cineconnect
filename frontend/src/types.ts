// shared types for frontend

export interface User {
  id: number
  email: string
  username: string
  /** timestamp retourné par l'API si disponible */
  createdAt?: string
}

export interface AuthResponse {
  token: string
  user: User
  success?: boolean
  message?: string
}

export interface ApiError {
  message: string
  [key: string]: any
}
