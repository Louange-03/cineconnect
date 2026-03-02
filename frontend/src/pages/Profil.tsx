import React from "react"
import { useAuth } from "../hooks/useAuth"

export function Profil(): JSX.Element {
  const { user } = useAuth()
  return (
    <div>
      <h1 className="text-2xl font-semibold">Profil</h1>
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
//