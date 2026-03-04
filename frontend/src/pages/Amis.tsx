import React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { FriendCard } from "../components/friends/FriendCard"
import { FriendRequestCard } from "../components/friends/FriendRequestCard"

type Friend = {
  id: string
  username: string
  email: string
}

type FriendRequest = {
  friendshipId: string
  fromUserId: string
  fromUsername: string
  email: string
  sentAt: string
}

type FriendsResponse = {
  friends: Friend[]
}

type RequestsResponse = {
  requests: FriendRequest[]
}

const API = "http://localhost:3001"

function authHeader(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("cineconnect_token")}`,
  }
}

async function fetchFriends(): Promise<FriendsResponse> {
  const res = await fetch(`${API}/friends`, { headers: authHeader() })
  if (!res.ok) throw new Error("Erreur chargement amis")
  return res.json()
}

async function fetchRequests(): Promise<RequestsResponse> {
  const res = await fetch(`${API}/friends/requests`, { headers: authHeader() })
  if (!res.ok) throw new Error("Erreur chargement demandes")
  return res.json()
}

async function postAccept(userId: string): Promise<void> {
  const res = await fetch(`${API}/friends/accept`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) throw new Error("Erreur acceptation")
}

async function postReject(userId: string): Promise<void> {
  const res = await fetch(`${API}/friends/reject`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) throw new Error("Erreur refus")
}

async function deleteFriend(userId: string): Promise<void> {
  const res = await fetch(`${API}/friends/${userId}`, {
    method: "DELETE",
    headers: authHeader(),
  })
  if (!res.ok) throw new Error("Erreur suppression")
}

export function Amis() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: friendsData } = useQuery({
    queryKey: ["friends"],
    queryFn: fetchFriends,
  })

  const { data: requestsData } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: fetchRequests,
  })

  const friends = friendsData?.friends ?? []
  const requests = requestsData?.requests ?? []

  const invalidate = (): void => {
    queryClient.invalidateQueries({ queryKey: ["friends"] })
    queryClient.invalidateQueries({ queryKey: ["friendRequests"] })
    queryClient.invalidateQueries({ queryKey: ["sentRequests"] })
  }

  const acceptMutation = useMutation({
    mutationFn: postAccept,
    onSuccess: invalidate,
  })

  const rejectMutation = useMutation({
    mutationFn: postReject,
    onSuccess: invalidate,
  })

  const removeMutation = useMutation({
    mutationFn: deleteFriend,
    onSuccess: invalidate,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-frost">Mes amis</h1>
          <p className="mt-1 text-sm text-frost/60">
            Gère tes amis et tes demandes.
          </p>
        </div>

        <Link
          to="/utilisateurs"
          className="rounded border border-ocean/30 px-3 py-2 text-sm text-frost hover:bg-ocean/10 transition-colors"
        >
          A la recherche de copain
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-frost">Demandes reçues</h2>

        {requests.length === 0 ? (
          <p className="text-frost/60">Aucune demande en attente.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <FriendRequestCard
                key={r.friendshipId}
                user={r}
                onAccept={(userId) => acceptMutation.mutate(userId)}
                onReject={(userId) => rejectMutation.mutate(userId)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-frost">Amis</h2>

        {friends.length === 0 ? (
          <p className="text-frost/60">Tu n'as pas encore d'amis.</p>
        ) : (
          <div className="space-y-3">
            {friends.map((f) => (
              <FriendCard
                key={f.id}
                user={f}
                onRemove={(userId) => removeMutation.mutate(userId)}
                onChat={(userId) =>
                  navigate({
                    to: "/discussion",
                    search: { userId },
                  })
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
