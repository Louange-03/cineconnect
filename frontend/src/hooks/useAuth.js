import { useEffect, useState } from "react"
import { fetchMe, getUser, isAuthenticated, logout } from "../lib/auth"

export function useAuth() {
  const [user, setUser] = useState(() => getUser())
  const [loading, setLoading] = useState(true)

  const isAuth = isAuthenticated()

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        if (isAuthenticated()) {
          const me = await fetchMe()
          if (mounted) setUser(me)
        } else {
          if (mounted) setUser(null)
        }
      } catch {
        // token invalide => on nettoie
        logout()
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()
    return () => {
      mounted = false
    }
  }, [])

  return { user, isAuth, loading }
}
