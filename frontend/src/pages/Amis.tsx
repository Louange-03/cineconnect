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

const API = "http://localhost:3001/api"

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
    <main className="min-h-screen bg-[#050B1C] text-white pt-24 pb-20 px-6">
      <div className="mx-auto max-w-5xl space-y-16">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">Mes Amis</h1>
            <p className="text-lg text-white/60 font-medium">
              Gérez vos relations et partagez votre passion avec vos potes.
            </p>
          </div>

          <Link
            to="/utilisateurs"
            className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] px-8 py-3.5 font-bold text-white shadow-[0_0_20px_rgba(29,108,224,0.35)] transition-all hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(29,108,224,0.55)] focus:outline-none focus:ring-2 focus:ring-[#3EA6FF]/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Recherche de copains
          </Link>
        </div>

        {/* Demandes reçues */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-4 text-white">
            Demandes reçues
            {requests.length > 0 && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] text-sm">{requests.length}</span>
            )}
          </h2>

          {requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center text-white/50 text-lg font-medium">
              Aucune demande en attente.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
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

        {/* Liste d'amis */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-white">
            Mon cercle
            <span className="text-white/40 text-xl font-normal">({friends.length})</span>
          </h2>

          {friends.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center text-white/50 text-lg font-medium">
              Tu n'as pas encore d'amis ajoutés.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
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
    </main>
  )
}
