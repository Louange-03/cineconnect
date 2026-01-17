import { useQuery } from "@tanstack/react-query"
import { useParams, Link } from "@tanstack/react-router"
import { omdbGetById } from "../lib/omdb"

export function FilmDetail() {
  const { id } = useParams({ from: "/film/$id" })

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["omdb", "film", id],
    queryFn: () => omdbGetById(id),
    staleTime: 60_000,
  })

  if (isLoading) return <p className="text-slate-600">Chargement…</p>

  if (isError) {
    return (
      <div className="space-y-3">
        <p className="text-red-600">
          Erreur : {error?.message || "Impossible de charger le film"}
        </p>
        <Link to="/films" className="underline">
          Retour aux films
        </Link>
      </div>
    )
  }

  const poster =
    data.Poster && data.Poster !== "N/A"
      ? data.Poster
      : "https://via.placeholder.com/300x450?text=No+Poster"

  return (
    <div className="space-y-6">
      <Link to="/films" className="text-sm underline">
        ← Retour aux films
      </Link>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <img src={poster} alt={data.Title} className="w-full rounded object-cover" />

        <div>
          <h1 className="text-2xl font-semibold">{data.Title}</h1>

          <p className="mt-1 text-slate-600">
            {data.Year}
            {data.Runtime && data.Runtime !== "N/A" ? ` • ${data.Runtime}` : ""}
            {data.Genre && data.Genre !== "N/A" ? ` • ${data.Genre}` : ""}
          </p>

          {data.imdbRating && data.imdbRating !== "N/A" && (
            <p className="mt-3">
              <span className="font-medium">Note IMDb :</span> {data.imdbRating}/10
            </p>
          )}

          <div className="mt-5 space-y-2">
            {data.Director && data.Director !== "N/A" && (
              <p>
                <span className="font-medium">Réalisateur :</span> {data.Director}
              </p>
            )}

            {data.Actors && data.Actors !== "N/A" && (
              <p>
                <span className="font-medium">Acteurs :</span> {data.Actors}
              </p>
            )}

            {data.Plot && data.Plot !== "N/A" && (
              <p>
                <span className="font-medium">Synopsis :</span> {data.Plot}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
