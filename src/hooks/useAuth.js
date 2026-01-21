import { getToken, getUser, setUser, clearUser, clearToken } from "../lib/auth"

export function useAuth() {
  const token = getToken()
  const user = getUser()

  function saveUser(nextUser) {
    setUser(nextUser)
  }

  function signOut() {
    clearToken()
    clearUser()
  }

  return {
    token,
    user,
    isAuth: Boolean(token),
    saveUser,
    signOut,
  }
}
