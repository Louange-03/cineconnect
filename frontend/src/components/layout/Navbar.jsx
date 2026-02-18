import { Link } from "@tanstack/react-router"
import { isAuthenticated, logout } from "../../lib/auth"
import { getInitialTheme, setTheme } from "../../lib/theme"
import { useEffect, useState } from "react"

function NavItem({ to, children }) {
  return (
    <Link
      to={to}
      className="rounded-xl px-3 py-2 text-sm font-medium text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--text)]"
      activeProps={{
        className:
          "bg-[color:var(--surface)] text-[color:var(--text)] shadow-sm",
      }}
    >
      {children}
    </Link>
  )
}

export function Navbar() {
  const isAuth = isAuthenticated()
  const [theme, setThemeState] = useState("light")

  useEffect(() => {
    setThemeState(getInitialTheme())
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--surface)] backdrop-blur">
      <div className="container-app flex items-center justify-between gap-3 py-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-semibold"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[color:var(--cinema)] text-white shadow-sm">
            CC
          </span>
          <span className="h-display text-base">CinéConnect</span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavItem to="/films">Films</NavItem>

          {isAuth && (
            <>
              <NavItem to="/amis">Amis</NavItem>
              <NavItem to="/discussion">Discussion</NavItem>
              <NavItem to="/profil">Profil</NavItem>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost hidden sm:inline-flex"
            onClick={() => {
              const next = theme === "dark" ? "light" : "dark"
              setThemeState(next)
              setTheme(next)
            }}
            aria-label="Changer de thème"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>

          {!isAuth ? (
            <>
              <Link className="btn btn-ghost" to="/login">
                Login
              </Link>
              <Link className="btn btn-primary" to="/register">
                Inscription
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                logout()
                window.location.href = "/login"
              }}
              className="btn btn-ghost"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
