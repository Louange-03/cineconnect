const TOKEN_KEY = "cineconnect_token"
const USER_KEY = "cineconnect_user"

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated() {
  return Boolean(getToken())
}

// Optionnel mais utile pour mock user (profil / reviews / amis)
export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null")
  } catch {
    return null
  }
}

export function clearUser() {
  localStorage.removeItem(USER_KEY)
}

// Alias pratiques (pour Navbar etc.)
export function login({ token, user }) {
  if (token) setToken(token)
  if (user) setUser(user)
}

export function logout() {
  clearToken()
  clearUser()
}
