
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

type UserItem = {
  id: string
  username: string
  email: string
}

type Friend = {
  id: string
  username: string
}

type FriendRequest = {
  fromUserId: string
  fromUsername: string
}

type SentRequest = {
  toUserId: string
  toUsername: string
}

type RelationStatus = "ami" | "demande_reçue" | "demande_envoyée" | "none"

// --- Fetch ---

const API = "http://localhost:3001"

function authHeader(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("cineconnect_token")}`,
  }
}

async function fetchUsers(): Promise<UserItem[]> {
  const res = await fetch(`${API}/users`, { headers: authHeader() })
  if (!res.ok) throw new Error("Erreur chargement utilisateurs")
  const data = await res.json() as { users: UserItem[] }
  return data.users
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

async function fetchSent(): Promise<{ sent: SentRequest[] }> {
  const res = await fetch(`${API}/friends/sent`, { headers: authHeader() })
  if (!res.ok) throw new Error("Erreur chargement demandes envoyées")
  return res.json() as Promise<{ sent: SentRequest[] }>
}

async function postFriendRequest(userId: string): Promise<void> {
  const res = await fetch(`${API}/friends/request`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) throw new Error("Erreur envoi demande")
}

async function deleteFriend(userId: string): Promise<void> {
  const res = await fetch(`${API}/friends/${userId}`, {
    method: "DELETE",
    headers: authHeader(),
  })
  if (!res.ok) throw new Error("Erreur annulation")
}

function getRelationStatus(
  userId: string,
  friendIds: Set<string>,
  receivedFromIds: Set<string>,
  sentToIds: Set<string>
): RelationStatus {
  if (friendIds.has(userId)) return "ami"
  if (receivedFromIds.has(userId)) return "demande_reçue"
  if (sentToIds.has(userId)) return "demande_envoyée"
  return "none"
}

export function Utilisateurs(): JSX.Element {
  const [search, setSearch] = useState("")
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  })

  const { data: friendsData } = useQuery({
    queryKey: ["friends"],
    queryFn: fetchFriends,
  })

  const { data: requestsData } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: fetchRequests,
  })

  const { data: sentData } = useQuery({
    queryKey: ["sentRequests"],
    queryFn: fetchSent,
  })

  const friends = friendsData?.friends ?? []
  const requests = requestsData?.requests ?? []
  const sent = sentData?.sent ?? []

  const friendIds = new Set(friends.map((f) => f.id))
  const receivedFromIds = new Set(requests.map((r) => r.fromUserId))
  const sentToIds = new Set(sent.map((s) => s.toUserId))

  const invalidate = (): void => {
    queryClient.invalidateQueries({ queryKey: ["friends"] })
    queryClient.invalidateQueries({ queryKey: ["friendRequests"] })
    queryClient.invalidateQueries({ queryKey: ["sentRequests"] })
  }

  const addMutation = useMutation({
    mutationFn: postFriendRequest,
    onSuccess: invalidate,
  })

  const cancelMutation = useMutation({
    mutationFn: deleteFriend,
    onSuccess: () => {
      setConfirmCancel(null)
      invalidate()
    },
  })

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Utilisateurs</h1>
        <p className="mt-1 text-sm text-slate-600">
          Recherche un utilisateur pour l'ajouter en ami.
        </p>
      </div>

      <input
        type="text"
        placeholder="Rechercher par pseudo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />

      {isLoading ? (
        <p className="text-sm text-slate-500">Chargement...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-500">Aucun utilisateur trouvé.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => {
            const status = getRelationStatus(u.id, friendIds, receivedFromIds, sentToIds)

            return (
              <div
                key={u.id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div>
                  <p className="font-medium">{u.username}</p>
                  <p className="text-sm text-slate-600">{u.email}</p>
                </div>

                <RelationBadge
                  userId={u.id}
                  status={status}
                  confirmCancel={confirmCancel}
                  onAdd={() => addMutation.mutate(u.id)}
                  onPendingClick={() => setConfirmCancel(u.id)}
                  onConfirmCancel={() => cancelMutation.mutate(u.id)}
                  onAbortCancel={() => setConfirmCancel(null)}
                  isPending={addMutation.isPending || cancelMutation.isPending}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// --- Badge ---

type RelationBadgeProps = {
  userId: string
  status: RelationStatus
  confirmCancel: string | null
  onAdd: () => void
  onPendingClick: () => void
  onConfirmCancel: () => void
  onAbortCancel: () => void
  isPending: boolean
}

function RelationBadge({
  userId,
  status,
  confirmCancel,
  onAdd,
  onPendingClick,
  onConfirmCancel,
  onAbortCancel,
  isPending,
}: RelationBadgeProps): JSX.Element {
  if (status === "ami") {
    return <span className="text-sm font-medium text-frost">✓ Ami</span>
  }

  if (status === "demande_reçue") {
    return <span className="text-sm text-frost">Demande reçue</span>
  }

  if (status === "demande_envoyée") {
    if (confirmCancel === userId) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-frost">Annuler la demande ?</span>
          <button
            type="button"
            onClick={onConfirmCancel}
            disabled={isPending}
            className="rounded border px-2 py-1 text-xs hover:bg-red-400"
          >
            Oui
          </button>
          <button
            type="button"
            onClick={onAbortCancel}
            className="rounded border px-2 py-1 text-xs hover:bg-imperial"
          >
            Non
          </button>
        </div>
      )
    }

    return (
      <button
        type="button"
        onClick={onPendingClick}
        className="rounded border border-ocean px-3 py-2 text-sm text-ocean hover:border-frost hover:text-frost"
      >
        En attente…
      </button>
    )
  }

  // status === "none"
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={isPending}
      className="rounded border border-ocean px-3 py-2 text-sm text-ocean hover:border-frost hover:text-frost"
    >
      + Ajouter
    </button>
  )
}