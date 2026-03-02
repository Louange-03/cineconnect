// frontend/src/pages/Amis.tsx

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
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

// --- Fetch ---

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
  return res.json() as Promise<FriendsResponse>
}

async function fetchRequests(): Promise<RequestsResponse> {
  const res = await fetch(`${API}/friends/requests`, { headers: authHeader() })
  if (!res.ok) throw new Error("Erreur chargement demandes")
  return res.json() as Promise<RequestsResponse>
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

export function Amis(): JSX.Element {
  const queryClient = useQueryClient()

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
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}