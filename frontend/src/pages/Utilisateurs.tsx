
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

const API = "http://localhost:3007/api"

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

export function Utilisateurs() {
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
    <main className="min-h-screen bg-[#050B1C] text-white pt-24 pb-20 px-6">
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-lg text-white">Recherche de copains</h1>
          <p className="text-lg text-white/60 max-w-lg mx-auto">
            Trouvez vos amis par leur pseudo et élargissez votre cercle de passionnés.
          </p>
        </div>

        <div className="relative group max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white/40 group-focus-within:text-[#3EA6FF] transition-colors">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher par pseudo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-white/20 bg-white/5 py-4 pl-14 pr-6 text-lg text-white placeholder-white/40 shadow-xl backdrop-blur-md outline-none transition-all focus:border-[#3EA6FF] focus:bg-white/10 focus:ring-4 focus:ring-[#3EA6FF]/20"
          />
        </div>

        <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-sm min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-4 pt-20">
              <div className="w-10 h-10 border-4 border-white/20 border-t-[#3EA6FF] rounded-full animate-spin" />
              <p className="text-lg font-medium">Recherche en cours...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-white/50 space-y-4 pt-16">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 opacity-50">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <p className="text-xl font-medium text-white/90">Aucun utilisateur trouvé</p>
              <p className="text-sm opacity-70">Essayez un autre pseudo.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filtered.map((u) => {
                const status = getRelationStatus(u.id, friendIds, receivedFromIds, sentToIds)

                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0A132D]/50 p-5 shadow-lg backdrop-blur-md transition-all hover:bg-white/10 hover:-translate-y-1 hover:border-white/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-lg font-black text-white shadow-inner">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="truncate text-lg font-bold text-white tracking-wide">{u.username}</p>
                        <p className="truncate text-sm font-medium text-gray-400">{u.email}</p>
                      </div>
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
      </div>
    </main>
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
}: RelationBadgeProps) {
  if (status === "ami") {
    return (
      <span className="flex shrink-0 items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 text-sm font-bold text-green-400 border border-green-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
        </svg>
        Ami
      </span>
    )
  }

  if (status === "demande_reçue") {
    return <span className="shrink-0 rounded-full bg-purple-500/20 px-4 py-2 text-sm font-bold text-purple-400 border border-purple-500/20">À accepter</span>
  }

  if (status === "demande_envoyée") {
    if (confirmCancel === userId) {
      return (
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-medium text-white/60 hidden sm:block">Annuler ?</span>
          <button
            type="button"
            onClick={onConfirmCancel}
            disabled={isPending}
            className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-red-600 disabled:opacity-50"
          >
            Oui
          </button>
          <button
            type="button"
            onClick={onAbortCancel}
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-white/20 border border-white/10"
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
        className="shrink-0 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white"
      >
        En attente
      </button>
    )
  }

  // status === "none"
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={isPending}
      className="flex shrink-0 items-center gap-2 rounded-full bg-[#1D6CE0] px-5 py-2 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#3EA6FF] hover:shadow-[0_0_15px_rgba(29,108,224,0.5)] disabled:opacity-50 disabled:hover:translate-y-0"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
      </svg>
      Ajouter
    </button>
  )
}
