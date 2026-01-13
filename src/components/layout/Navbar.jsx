import { Link } from "@tanstack/react-router"
import { isAuthenticated, clearToken } from "../../lib/auth"

export function Navbar() {
  const isAuth = isAuthenticated()

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link to="/" className="font-semibold">
          CinéConnect
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/films" className="[&.active]:underline">Films</Link>
          <Link to="/discussion" className="[&.active]:underline">Discussion</Link>

          {isAuth ? (
            <>
              <Link to="/profil" className="[&.active]:underline">Profil</Link>
              <button
                className="rounded border px-3 py-1"
                onClick={() => {
                  clearToken()
                  window.location.href = "/login"
                }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="[&.active]:underline">Connexion</Link>
              <Link to="/register" className="[&.active]:underline">Inscription</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
