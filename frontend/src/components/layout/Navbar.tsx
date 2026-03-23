import React, { useEffect, useMemo, useState } from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import { isAuthenticated, logout } from "../../lib/auth"
import { getTheme, toggleTheme, type ThemeMode } from "../../lib/theme"
import type { ReactNode } from "react"

type NavLinkItem = {
  to: any
  label: string
  search?: any
  requireAuth?: boolean
  /** Affiché seulement dans le menu mobile (maquette desktop : 4 liens centraux) */
  mobileOnly?: boolean
}

function usePathname() {
  return useRouterState({ select: (s) => s.location.pathname })
}

function NavItem({ to, label, search }: NavLinkItem) {
  const pathname = usePathname()
  const active =
    pathname === to || (to !== "/" && pathname.startsWith(to))

  return (
    <Link
      to={to}
      search={search}
      aria-current={active ? "page" : undefined}
      className={[
        "group relative px-4 py-2 text-sm font-medium transition-colors duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007BFF]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C] rounded-lg",
        active ? "text-white" : "text-gray-400 hover:text-white",
      ].join(" ")}
    >
      {label}
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#007BFF] transition-opacity duration-200",
          active ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </Link>
  )
}

export function Navbar() {
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
      { to: "/films", label: "Films", search: { q: "", category: "", type: "movie", sort: "" } },
      { to: "/amis", label: "Amis", requireAuth: true },
      { to: "/discussion", label: "Discussion", requireAuth: true },
      { to: "/profil", label: "Profil", requireAuth: true },
    ],
    [],
  )

  const visibleNav = nav.filter((n) => !n.requireAuth || isAuth)
  const desktopNav = visibleNav.filter((n) => !n.mobileOnly)

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl">
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-10">
        {/* Brand — maquette : icône caméra + mot-clé */}
        <Link to="/" className="group relative z-20 flex items-center gap-2.5 md:gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#007BFF] shadow-[0_0_20px_rgba(0,123,255,0.35)] transition-transform duration-300 group-hover:scale-105 md:h-10 md:w-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="white"
              className="h-5 w-5 md:h-6 md:w-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>

          <span className="text-xl font-black tracking-tight text-white md:text-2xl">
            CinéConnect
          </span>
        </Link>

        {/* Desktop nav — centré (maquette) */}
        <nav
          className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block"
          aria-label="Navigation principale"
        >
          <div className="pointer-events-auto flex items-center gap-1 lg:gap-2">
            {desktopNav.map((item) => (
              <NavItem key={`${item.to}-${item.label}`} {...item} />
            ))}
          </div>
        </nav>

        {/* Actions */}
        <div className="relative z-20 flex items-center gap-2 md:gap-3">
          <Link
            to="/films"
            search={{ q: "", category: "", type: "movie", sort: "" }}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300/70 transition-colors hover:bg-white/10 hover:text-white sm:flex"
            title="Rechercher"
            aria-label="Aller au catalogue"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </Link>

          <button
            type="button"
            onClick={() => setTheme(toggleTheme())}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 md:inline-flex"
            title={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
            aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M12 2.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75ZM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0Zm-.53-6.03a.75.75 0 10-1.06 1.06l1.06 1.06a.75.75 0 101.06-1.06L6.97 5.97Zm10 10a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06ZM3 11.25a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H3Zm16.5 0a.75.75 0 000 1.5H21a.75.75 0 000-1.5h-1.5ZM5.91 18.09a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06Zm12.12-12.12a.75.75 0 011.06 0 .75.75 0 010 1.06l-1.06 1.06a.75.75 0 11-1.06-1.06l1.06-1.06ZM12 19.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0112 19.5Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.82 8.25 8.25 0 0010.593 10.593.75.75 0 01.982.98A9.75 9.75 0 1110.51 2.356a.75.75 0 01-.982-.638Z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {!isAuth ? (
            <Link
              to="/login"
              className="rounded-full bg-[#007BFF] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(0,123,255,0.4)] transition hover:bg-[#0066dd] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007BFF]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] md:px-6"
            >
              Connexion
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="rounded-full bg-white/10 px-6 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20 hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              Déconnexion
            </button>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 md:hidden"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden">
          <div className="mx-auto max-w-7xl px-6 pb-5 md:px-12">
            <div className="mt-3 rounded-2xl border border-white/10 bg-[#0A132D]/60 p-3 backdrop-blur-xl motion-safe:animate-fade-in">
              <div className="flex flex-col gap-2">
                {visibleNav.map((item) => (
                  <Link
                    key={`${item.to}-${item.label}`}
                    to={item.to}
                    search={item.search}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setTheme(toggleTheme())
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/90 transition hover:bg-white/10 md:hidden"
                >
                  {theme === "dark" ? "Mode clair" : "Mode sombre"}
                </button>
                {isAuth ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout()
                      setMobileOpen(false)
                    }}
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10 text-left"
                  >
                    Déconnexion
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}