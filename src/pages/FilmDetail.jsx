import { useParams } from "@tanstack/react-router"

export function FilmDetail() {
  const { id } = useParams({ from: "/film/$id" })

  return (
    <div>
      <h1 className="text-2xl font-semibold">Détail du film</h1>
      <p className="mt-2 text-slate-600">
        ID du film : {id}
      </p>
    </div>
  )
}
