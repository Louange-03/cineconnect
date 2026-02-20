import React from "react"
import { useAuth } from "../hooks/useAuth"
import { useLocation } from "@tanstack/react-router"

export function Profil(): JSX.Element {
  const { user } = useAuth()
  const location = useLocation()
  const message = (location.state as any)?.message as string | undefined

  return (
    <div>
      <h1 className="text-2xl font-semibold">Profil</h1>
      {message && <p className="mt-2 text-green-600">{message}</p>}
      {user ? (
        <div className="mt-4">
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
        </div>
      ) : (
        <p className="text-slate-600">Pas connecté</p>
      )}
    </div>
  )
}