import { Link } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchUsers } from "../lib/userApi"
import {
  fetchFriends,
  fetchFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../lib/friends"

import { FriendCard } from "../components/friends/FriendCard"
import { FriendRequestCard } from "../components/friends/FriendRequestCard"

interface UserWithEmail {
  id: number
  username: string
  email: string
}

interface RequestWithDetails {
  id: number
  username: string
  email: string
  fromUserId: number
  friendshipId: number
  createdAt: string
}

export function Amis() {
  const qc = useQueryClient()

  // On récupère tous les users pour retrouver email (car friends/requests ne le renvoient pas)
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers(),
    staleTime: 30_000,
  })

  const friendsQuery = useQuery({
    queryKey: ["friends"],
    queryFn: fetchFriends,
    staleTime: 10_000,
  })

  const requestsQuery = useQuery({
    queryKey: ["friendRequests"],
    queryFn: fetchFriendRequests,
    staleTime: 10_000,
  })

  const acceptMutation = useMutation({
    mutationFn: (requesterId: number) => acceptFriendRequest(requesterId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["friends"] })
      await qc.invalidateQueries({ queryKey: ["friendRequests"] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (requesterId: number) => rejectFriendRequest(requesterId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["friends"] })
      await qc.invalidateQueries({ queryKey: ["friendRequests"] })
    },
  })

  const allUsers = usersQuery.data?.users || []
  const emailById = new Map(allUsers.map((u) => [u.id, u.email]))

  const friendsRaw = friendsQuery.data?.friends || []
  const friends: UserWithEmail[] = friendsRaw.map((u) => ({ ...u, email: emailById.get(u.id) || "" }))

  const requestsRaw = requestsQuery.data?.requests || []
  const requests: RequestWithDetails[] = requestsRaw.map((r: any) => ({
    id: r.fromUserId,
    username: r.fromUsername,
    email: emailById.get(r.fromUserId) || "",
    fromUserId: r.fromUserId,
    friendshipId: r.friendshipId,
    createdAt: r.createdAt,
  }))

  const loading = usersQuery.isLoading || friendsQuery.isLoading || requestsQuery.isLoading
  const error =
    usersQuery.error?.message ||
    friendsQuery.error?.message ||
    requestsQuery.error?.message ||
    acceptMutation.error?.message ||
    rejectMutation.error?.message

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Mes amis</h1>
          <p className="mt-1 text-sm text-slate-600">Gère tes amis et tes demandes.</p>
        </div>

        <Link
          to="/utilisateurs"
          className="rounded border px-3 py-2 text-sm hover:bg-slate-50"
        >
          Trouver des utilisateurs
        </Link>
      </div>

      {loading && <p className="text-slate-600">Chargement…</p>}
      {error && <p className="text-red-600">Erreur : {error}</p>}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Demandes reçues</h2>

        {!loading && requests.length === 0 ? (
          <p className="text-slate-600">Aucune demande en attente.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((u) => (
              <FriendRequestCard
                key={u.friendshipId}
                user={u}
                onAccept={() => acceptMutation.mutate(u.fromUserId)}
                onReject={() => rejectMutation.mutate(u.fromUserId)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Amis</h2>

        {!loading && friends.length === 0 ? (
          <p className="text-slate-600">Tu n'as pas encore d'amis.</p>
        ) : (
          <div className="space-y-3">
            {friends.map((u) => (
              <FriendCard
                key={u.id}
                user={u}
                // pas de delete encore côté API -> on désactive juste
                onRemove={() => alert("Suppression d'ami: à implémenter côté backend")}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
