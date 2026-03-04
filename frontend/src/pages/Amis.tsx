import React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"


import type { Friend, FriendRequest } from "../types"
import { FriendCard } from "../components/friends/FriendCard"
import { FriendRequestCard } from "../components/friends/FriendRequestCard"

const API = "http://localhost:3001"

function authHeader(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("cineconnect_token")}`,
  }
}

async function fetchFriends(): Promise<{ friends: Friend[] }> {
  const res = await fetch(`${API}/friends`, { headers: authHeader() })
  if (!res.ok) throw new Error("Erreur chargement amis")
  return res.json() as Promise<{ friends: Friend[] }>
}

async function fetchRequests(): Promise<{ requests: FriendRequest[] }> {
  const res = await fetch(`${API}/friends/requests`, { headers: authHeader() })
  if (!res.ok) throw new Error("Erreur chargement demandes")
  return res.json() as Promise<{ requests: FriendRequest[] }>
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

  const friends: Friend[] = friendsData?.friends ?? []
  const requests: FriendRequest[] = requestsData?.requests ?? []

  const invalidate = (): void => {
    queryClient.invalidateQueries({ queryKey: ["friends"] })
    queryClient.invalidateQueries({ queryKey: ["friendRequests"] })
    queryClient.invalidateQueries({ queryKey: ["sentRequests"] })
  }

  const acceptMutation = useMutation({
    mutationFn: (userId: string) => postAccept(userId),
    onSuccess: invalidate,
  })

  const rejectMutation = useMutation({
    mutationFn: (userId: string) => postReject(userId),
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

        {requests.length === 0 ? (
          <p className="text-slate-600">Aucune demande en attente.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <FriendRequestCard
                key={r.id}
                user={{ id: r.id, username: r.requesterUsername, email: "" }}
                onAccept={(e) => acceptMutation.mutate(r.id)}
                onReject={(e) => rejectMutation.mutate(r.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Amis</h2>

        {friends.length === 0 ? (
          <p className="text-slate-600">Tu n'as pas encore d'amis.</p>
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
