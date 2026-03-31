import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createFriendRequest,
  fetchFriends,
  fetchRequests,
  fetchSentRequests,
  fetchUsers,
  removeFriend,
} from "../services/friends.service"

export type RelationStatus = "ami" | "demande_reçue" | "demande_envoyée" | "none"

function getRelationStatus(
  userId: string,
  friendIds: Set<string>,
  receivedFromIds: Set<string>,
  sentToIds: Set<string>,
): RelationStatus {
  if (friendIds.has(userId)) return "ami"
  if (receivedFromIds.has(userId)) return "demande_reçue"
  if (sentToIds.has(userId)) return "demande_envoyée"
  return "none"
}

export function useUtilisateursPage() {
  const [search, setSearch] = useState("")
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    retry: 1,
  })
  const { data: friendsData } = useQuery({ queryKey: ["friends"], queryFn: fetchFriends })
  const { data: requestsData } = useQuery({ queryKey: ["friendRequests"], queryFn: fetchRequests })
  const { data: sentData } = useQuery({ queryKey: ["sentRequests"], queryFn: fetchSentRequests })

  const friends = friendsData?.friends ?? []
  const requests = requestsData?.requests ?? []
  const sent = sentData?.sent ?? []

  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends])
  const receivedFromIds = useMemo(() => new Set(requests.map((r) => r.fromUserId)), [requests])
  const sentToIds = useMemo(() => new Set(sent.map((s) => s.toUserId)), [sent])

  const invalidate = (): void => {
    queryClient.invalidateQueries({ queryKey: ["friends"] })
    queryClient.invalidateQueries({ queryKey: ["friendRequests"] })
    queryClient.invalidateQueries({ queryKey: ["sentRequests"] })
  }

  const addMutation = useMutation({
    mutationFn: createFriendRequest,
    onSuccess: () => {
      setActionError(null)
      invalidate()
    },
    onError: () => setActionError("Impossible d'envoyer la demande pour le moment."),
  })

  const cancelMutation = useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      setConfirmCancel(null)
      setActionError(null)
      invalidate()
    },
    onError: () => setActionError("Impossible d'annuler la demande."),
  })

  const filtered = useMemo(
    () => users.filter((u) => (u.username ?? "").toLowerCase().includes(search.toLowerCase())),
    [search, users],
  )

  return {
    search,
    setSearch,
    confirmCancel,
    setConfirmCancel,
    actionError,
    isLoading,
    isError,
    filtered,
    addMutation,
    cancelMutation,
    getStatus: (userId: string) => getRelationStatus(userId, friendIds, receivedFromIds, sentToIds),
  }
}
