import { useState } from "react"
import { clearToken, getToken, setToken } from "../lib/auth"

const MOCK_USER = {
  id: "u_1",
  email: "demo@cineconnect.dev",
  username: "demo",
  createdAt: new Date().toISOString(),
}

export function useAuth() {
  const [token, setTokenState] = useState(getToken())
  const [user, setUser] = useState(token ? MOCK_USER : null)

  async function login(email, password) {
    if (!email || !password) throw new Error("Email et mot de passe requis")
    const fakeToken = "mock.jwt.token"
    setToken(fakeToken)
    setTokenState(fakeToken)
    setUser({ ...MOCK_USER, email })
  }

  async function register(email, username, password) {
    if (!email || !username || !password) throw new Error("Tous les champs sont requis")
    const fakeToken = "mock.jwt.token"
    setToken(fakeToken)
    setTokenState(fakeToken)
    setUser({ ...MOCK_USER, email, username })
  }

  function logout() {
    clearToken()
    setTokenState(null)
    setUser(null)
  }

  return { token, user, isAuth: Boolean(token), login, register, logout }
}
