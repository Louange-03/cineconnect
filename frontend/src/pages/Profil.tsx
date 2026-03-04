import { Link } from "@tanstack/react-router"
import { useAuth } from "../hooks/useAuth"
import { useLocation } from "@tanstack/react-router"

type FavoriteFilm = {
  id: number
  title: string
  year: string
  posterUrl: string | null
}

type FilmCardProps = {
  film: FavoriteFilm
}

function FilmCard({ film }: FilmCardProps) {
  return (
    <div className="rounded border border-slate-700 overflow-hidden bg-slate-800 hover:border-slate-500 transition">
      {film.posterUrl ? (
        <img
          src={film.posterUrl}
          alt={film.title}
          className="w-full h-36 object-cover"
        />
      ) : (
        <div className="w-full h-36 bg-slate-700 flex items-center justify-center">
          <span className="text-slate-400 text-xs">Pas d'affiche</span>
        </div>
      )}
      <div className="p-2">
        <p className="text-sm font-medium text-white truncate">{film.title}</p>
        <p className="text-xs text-slate-400">{film.year}</p>
      </div>
    </div>
  )
}

export function Profil() {
  const { user } = useAuth()
  const location = useLocation()
  const message = (location.state as any)?.message as string | undefined

  // Films favoris — à brancher sur l'API
  const favoriteFilms: FavoriteFilm[] = []

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
        <p className="text-lg">Tu n'es pas connecté.</p>
        <Link to="/login" className="text-blue-400 hover:underline text-sm">
          Se connecter
        </Link>
      </div>
    )
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    })
    : null

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {message && <div className="rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 p-3 text-sm">{message}</div>}
      <div className="flex items-center justify-between gap-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-white truncate">
            {user.username}
          </h1>
          <p className="text-sm text-slate-400 truncate">{user.email}</p>
          {memberSince && (
            <p className="text-xs text-slate-500 mt-1">
              Membre depuis {memberSince}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => alert("Paramètres à venir")}
          className="shrink-0 rounded border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:border-slate-400 hover:text-white transition"
        >
          Paramètres
        </button>
      </div>

      <hr className="border-slate-700" />
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Films favoris</h2>

        {favoriteFilms.length === 0 ? (
          <div className="rounded border border-dashed border-slate-700 p-8 text-center space-y-2">
            <p className="text-slate-400 text-sm">
              Aucun film en favori pour l'instant.
            </p>
            <Link
              to="/films"
              search={{ q: "", category: "", type: "movie", sort: "" }}
              className="text-blue-400 hover:underline text-sm"
            >
              Explorer les films →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {favoriteFilms.map((film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}