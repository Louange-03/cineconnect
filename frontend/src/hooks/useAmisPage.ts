import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  acceptFriendRequest,
  fetchFriends,
  fetchRequests,
  rejectFriendRequest,
  removeFriend,
  startConversation,
} from "../services/friends.service"

export function useAmisPage() {
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: friendsData, isError: friendsError } = useQuery({
    queryKey: ["friends"],
    queryFn: fetchFriends,
  })

  const { data: requestsData, isError: requestsError } = useQuery({
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
    mutationFn: async (userId: string) => {
      await acceptFriendRequest(userId)
      await startConversation(userId)
    },
    onSuccess: () => {
      setActionError(null)
      invalidate()
    },
    onError: () => {
      setActionError("Impossible d'accepter cette demande.")
    },
  })

  const rejectMutation = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      setActionError(null)
      invalidate()
    },
    onError: () => {
      setActionError("Impossible de refuser cette demande.")
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      setActionError(null)
      invalidate()
    },
    onError: () => {
      setActionError("Impossible de supprimer cet ami.")
    },
  })

  async function openChat(userId: string) {
    try {
      await startConversation(userId)
    } finally {
      window.location.href = "/discussion"
    }
  }

  return {
    friendsError,
    requestsError,
    actionError,
    friends,
    requests,
    acceptMutation,
    rejectMutation,
    removeMutation,
    openChat,
  }
}
