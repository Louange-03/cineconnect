import { Link } from "@tanstack/react-router"
import { isAuthenticated, logout } from "../../lib/auth"

function NavItem({ to, children }) {
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
