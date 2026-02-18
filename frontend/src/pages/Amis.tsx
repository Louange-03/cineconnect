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
import type { User } from "../types"

export function Amis() {
  const { user } = useAuth()
  const myId = user?.id?.toString() || "u_1" // fallback local

  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    seedUsersIfEmpty()
    setRefresh((x) => x + 1)
  }, [])

  // convert stored UserItem[] (ids as strings) to our User[] type
  const users: User[] = useMemo(
    () =>
      getAllUsers().map((u) => ({
        id: parseInt(u.id, 10) || 0,
        email: u.email,
        username: u.username,
      })),
    [refresh]
  )

  const friendUsers = useMemo(() => {
    const rel = getMyFriends(myId)
    const ids = rel.map((r) => (r.userId === myId ? r.friendId : r.userId))
    return ids
      .map((id) => users.find((u) => u.id.toString() === id))
      .filter((u): u is User => u !== undefined)
  }, [users, myId, refresh])

  const requestUsers = useMemo(() => {
    const rel = getMyRequests(myId)
    const ids = rel.map((r) => r.userId)
    return ids
      .map((id) => users.find((u) => u.id.toString() === id))
      .filter((u): u is User => u !== undefined)
  }, [users, myId, refresh])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Mes amis</h1>
          <p className="mt-1 text-sm text-slate-600">
            Gère tes amis et tes demandes.
          </p>
        </div>

        <Link
          to="/utilisateurs"
          className="rounded border px-3 py-2 text-sm hover:bg-slate-50"
        >
          Trouver des utilisateurs
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Demandes reçues</h2>

        {requestUsers.length === 0 ? (
          <p className="text-slate-600">Aucune demande en attente.</p>
        ) : (
          <div className="space-y-3">
            {requestUsers.map((u) => (
              <FriendRequestCard
                key={u.id}
                user={u}
                onAccept={() => {
                  acceptRequest(myId, u.id.toString())
                  setRefresh((x) => x + 1)
                }}
                onReject={() => {
                  rejectRequest(myId, u.id.toString())
                  setRefresh((x) => x + 1)
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Amis</h2>

        {friendUsers.length === 0 ? (
          <p className="text-slate-600">Tu n’as pas encore d’amis.</p>
        ) : (
          <div className="space-y-3">
            {friendUsers.map((u) => (
              <FriendCard
                key={u.id}
                user={u}
                onRemove={() => {
                  removeFriendRelation(myId, u.id.toString())
                  setRefresh((x) => x + 1)
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
