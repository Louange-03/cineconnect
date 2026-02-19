import React from "react"
import { useParams } from "@tanstack/react-router"

export function FilmDetail(): JSX.Element {
  const { id } = useParams()

  return (
    <div>
      <h1 className="text-2xl font-semibold">Détail du film</h1>
      <p className="mt-2 text-slate-600">ID: {id}</p>
    </div>
  )
}