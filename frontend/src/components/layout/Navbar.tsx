import { Link } from "@tanstack/react-router"
import { isAuthenticated, logout, getUser } from "../../lib/auth"
import type { ReactNode } from "react"

function NavItem({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded px-3 py-2 text-sm hover:bg-slate-100"
      activeProps={{ className: "bg-slate-200 font-medium" }}
    >
      {children}
    </Link>
  )
}

export function Navbar() {
  const isAuth = isAuthenticated()
  const user = getUser()

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold">
          CinéConnect
        </Link>

        <nav className="flex items-center gap-2">
          <NavItem to="/films">Films</NavItem>

          {isAuth && (
            <>
              <NavItem to="/amis">Amis</NavItem>
              <NavItem to="/discussion">Discussion</NavItem>
              <NavItem to="/profil">Profil</NavItem>
              {user && <span className="ml-2 text-sm">{user.username}</span>}
            </>
          )}

          {!isAuth ? (
            <>
              <NavItem to="/login">Login</NavItem>
              <NavItem to="/register">Inscription</NavItem>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                logout()
                window.location.href = "/login"
              }}
              className="rounded px-3 py-2 text-sm hover:bg-slate-100"
            >
              Déconnexion
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
