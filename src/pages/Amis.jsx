import { useEffect, useMemo, useState } from "react"
import { Navigate, Link } from "@tanstack/react-router"
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
  const { user, isAuth } = useAuth()
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    seedUsersIfEmpty()
  }, [])

  const users = useMemo(() => getAllUsers(), [refresh])
  const myId = user?.id

  const friends = useMemo(() => {
    if (!myId) return []
    const rel = getMyFriends(myId)
    return rel
      .map((r) => (r.userId === myId ? r.friendId : r.userId))
      .map((id) => users.find((u) => u.id === id))
      .filter(Boolean)
  }, [users, myId, refresh])

  const requests = useMemo(() => {
    if (!myId) return []
    const rel = getMyRequests(myId)
    return rel
      .map((r) => users.find((u) => u.id === r.userId))
      .filter(Boolean)
  }, [users, myId, refresh])

  if (!isAuth) return <Navigate to="/login" />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Mes amis</h1>
          <p className="mt-1 text-sm text-slate-600">
            Gère tes amis et tes demandes.
          </p>
        </div>

        <Link to="/utilisateurs" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">
          Trouver des utilisateurs
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Demandes reçues</h2>
        {requests.length === 0 ? (
          <p className="text-slate-600">Aucune demande en attente.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((u) => (
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

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Amis</h2>
        {friends.length === 0 ? (
          <p className="text-slate-600">Tu n’as pas encore d’amis.</p>
        ) : (
          <div className="space-y-3">
            {friends.map((u) => (
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
  )
}
