import { useEffect, useMemo, useState } from "react"
import { isAuthenticated, logout } from "../lib/auth"
import { getTheme, toggleTheme, type ThemeMode } from "../lib/theme"

type NavLinkItem = {
  to: any
  label: string
  search?: any
  requireAuth?: boolean
  mobileOnly?: boolean
}

export function useNavbarState() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isAuth, setIsAuth] = useState(isAuthenticated())
  const [theme, setTheme] = useState<ThemeMode>(getTheme())

  useEffect(() => {
    const syncAuth = () => setIsAuth(isAuthenticated())
    syncAuth()
    window.addEventListener("auth-changed", syncAuth)
    window.addEventListener("storage", syncAuth)
    window.addEventListener("focus", syncAuth)
    return () => {
      window.removeEventListener("auth-changed", syncAuth)
      window.removeEventListener("storage", syncAuth)
      window.removeEventListener("focus", syncAuth)
    }
  }, [])

  useEffect(() => {
    const syncTheme = () => setTheme(getTheme())
    window.addEventListener("theme-changed", syncTheme as EventListener)
    return () => {
      window.removeEventListener("theme-changed", syncTheme as EventListener)
    }
  }, [])

  const nav = useMemo<NavLinkItem[]>(
    () => [
      { to: "/", label: "Accueil" },
      { to: "/films", label: "Films", search: { q: "", category: "", type: "all", sort: "" } },
      { to: "/amis", label: "Amis", requireAuth: true },
      { to: "/discussion", label: "Discussion", requireAuth: true },
      { to: "/profil", label: "Profil", requireAuth: true },
    ],
    [],
  )

  const visibleNav = useMemo(() => nav.filter((n) => !n.requireAuth || isAuth), [isAuth, nav])
  const desktopNav = useMemo(() => visibleNav.filter((n) => !n.mobileOnly), [visibleNav])

  function doLogout() {
    logout()
    window.location.href = "/login"
  }

  function toggleThemeMode() {
    setTheme(toggleTheme())
  }

  return {
    mobileOpen,
    setMobileOpen,
    isAuth,
    theme,
    visibleNav,
    desktopNav,
    doLogout,
    toggleThemeMode,
  }
}
