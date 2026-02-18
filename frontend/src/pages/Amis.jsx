import { useEffect, useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { useAuth } from "../hooks/useAuth"

import {
  acceptRequest,
  getAllUsers,
  getMyFriends,
  getMyRequests,
  rejectRequest,
  removeFriendRelation,
  seedUsersIfEmpty,
} from "../lib/friends"

import { FriendCard } from "../components/friends/FriendCard"
import { FriendRequestCard } from "../components/friends/FriendRequestCard"

export function Amis() {
  const { user } = useAuth()
  const myId = user?.id || "u_1" // fallback local

  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    seedUsersIfEmpty()
    // Avoid setState in effect body (eslint react-hooks warning)
    setRefresh(1)
  }, [])

  const users = useMemo(() => getAllUsers(), [refresh])

  const friendUsers = useMemo(() => {
    const rel = getMyFriends(myId)
    const ids = rel.map((r) => (r.userId === myId ? r.friendId : r.userId))
    return ids.map((id) => users.find((u) => u.id === id)).filter(Boolean)
  }, [users, myId, refresh])

  const requestUsers = useMemo(() => {
    const rel = getMyRequests(myId)
    const ids = rel.map((r) => r.userId)
    return ids.map((id) => users.find((u) => u.id === id)).filter(Boolean)
  }, [users, myId, refresh])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="h-display text-2xl font-semibold">Amis</h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Gère tes amis et tes demandes.
          </p>
        </div>

        <Link to="/utilisateurs" className="btn btn-primary w-fit">
          Trouver des utilisateurs
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-6">
          <div className="mb-4">
            <h2 className="h-display text-lg font-semibold">Demandes reçues</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Accepte ou refuse les demandes d’amis.
            </p>
          </div>

          {requestUsers.length === 0 ? (
            <p className="text-sm text-[color:var(--muted)]">
              Aucune demande en attente.
            </p>
          ) : (
            <div className="space-y-3">
              {requestUsers.map((u) => (
                <FriendRequestCard
                  key={u.id}
                  user={u}
                  onAccept={() => {
                    acceptRequest(myId, u.id)
                    setRefresh((x) => x + 1)
                  }}
                  onReject={() => {
                    rejectRequest(myId, u.id)
                    setRefresh((x) => x + 1)
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section className="surface p-6">
          <div className="mb-4">
            <h2 className="h-display text-lg font-semibold">Mes amis</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Retrouve tes amis et gère ta liste.
            </p>
          </div>

          {friendUsers.length === 0 ? (
            <p className="text-sm text-[color:var(--muted)]">
              Tu n’as pas encore d’amis.
            </p>
          ) : (
            <div className="space-y-3">
              {friendUsers.map((u) => (
                <FriendCard
                  key={u.id}
                  user={u}
                  onRemove={() => {
                    removeFriendRelation(myId, u.id)
                    setRefresh((x) => x + 1)
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
