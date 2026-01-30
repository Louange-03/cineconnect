import { useEffect, useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { useAuth } from "../hooks/useAuth"

import {
  getAllUsers,
  getFriendRelations,
  searchUsers,
  seedUsersIfEmpty,
  sendFriendRequest,
} from "../lib/friends"

export function Utilisateurs() {
  const { user } = useAuth()
  const myId = user?.id || "u_1"

  const [q, setQ] = useState("")
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    seedUsersIfEmpty()
    setRefresh((x) => x + 1)
  }, [])

  const users = useMemo(() => getAllUsers(), [refresh])
  const results = useMemo(() => searchUsers(q), [q, refresh])
  const relations = useMemo(() => getFriendRelations(), [refresh])

  function statusWith(targetId) {
    const r = relations.find(
      (x) =>
        (x.userId === myId && x.friendId === targetId) ||
        (x.userId === targetId && x.friendId === myId)
    )
    return r?.status || null
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Utilisateurs</h1>
          <p className="mt-1 text-sm text-slate-600">
            Recherche et envoie des demandes d’amis.
          </p>
        </div>

        <Link
          to="/amis"
          className="rounded border px-3 py-2 text-sm hover:bg-slate-50"
        >
          ← Retour amis
        </Link>
      </div>

      <input
        className="w-full max-w-md rounded border px-3 py-2"
        placeholder="Rechercher par username ou email…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="space-y-3">
        {results
          .filter((u) => u.id !== myId)
          .map((u) => {
            const st = statusWith(u.id)

            return (
              <div
                key={u.id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div>
                  <p className="font-medium">{u.username}</p>
                  <p className="text-sm text-slate-600">{u.email}</p>
                </div>

                {st === "accepted" ? (
                  <span className="text-sm text-slate-600">Déjà ami</span>
                ) : st === "pending" ? (
                  <span className="text-sm text-slate-600">Demande envoyée</span>
                ) : (
                  <button
                    type="button"
                    className="rounded bg-black px-3 py-2 text-sm text-white"
                    onClick={() => {
                      sendFriendRequest(myId, u.id)
                      setRefresh((x) => x + 1)
                    }}
                  >
                    Ajouter
                  </button>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
