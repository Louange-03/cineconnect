import { Link } from "@tanstack/react-router"
import { isAuthenticated, logout } from "../../lib/auth"
import type { ReactNode } from "react"

interface NavItemProps {
  to: string
  children: ReactNode
}

function NavItem({ to, children }: NavItemProps): JSX.Element {
  return (
    <Link
      to={to}
      className="relative px-4 py-2 text-sm text-frost/70 transition-colors hover:text-frost after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-ocean after:transition-all hover:after:w-full"
      activeProps={{ className: "text-frost after:w-full" }}
    >
      {children}
    </Link>
  )
}

export function Navbar(): JSX.Element {
  const isAuth = isAuthenticated()
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-ocean/10 bg-prussian/95 backdrop-blur-md">
      <div className="flex items-center justify-between px-16 py-4">
        <Link to="/" className="text-2xl font-bold tracking-widest bg-gradient-to-r from-ocean to-frost bg-clip-text text-transparent">
          CINÉCONNECT
        </Link>
        <nav className="flex items-center gap-6">
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
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                logout()
                window.location.href = "/login"
              }}
              className="rounded-full bg-ocean px-4 py-2 text-sm text-white transition-all hover:-translate-y-0.5 hover:bg-ocean/80 hover:shadow-[0_10px_30px_rgba(14,107,168,0.4)]"
            >
              Déconnexion
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}