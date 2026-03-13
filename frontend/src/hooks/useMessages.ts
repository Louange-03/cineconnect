import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getToken } from "../lib/auth"

export type Message = {
    id: string
    senderId: string
    receiverId: string
    content: string
    read: boolean
    createdAt: string
    sender?: { id: string; username: string }
    receiver?: { id: string; username: string }
}

export type ConversationItem = {
    userId: string
    username: string
    lastMessage: Message
    unreadCount?: number
}

// 1. Fetch Inbox (liste des conversations)
export function useInbox() {
    return useQuery<ConversationItem[], Error>({
        queryKey: ["inbox"],
        queryFn: async () => {
            const token = getToken()
            if (!token) return [] // or throw

            const res = await fetch("/api/messages/inbox", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            })
            if (!res.ok) throw new Error("Erreur inbox")
            const data = await res.json()
            return data.inbox ?? []
        },
        refetchInterval: 5000, // Poll every 5s for new messages
    })
}

// 2. Fetch discussion with specific user
export function useConversation(otherUserId: string | null) {
    return useQuery<Message[], Error>({
        queryKey: ["conversation", otherUserId],
        enabled: !!otherUserId,
        queryFn: async () => {
            const token = getToken()
            if (!token) return []

            const res = await fetch(`/api/messages/conversation/${otherUserId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            })
            if (!res.ok) throw new Error("Erreur conversation")
            const data = await res.json()
            return data.messages ?? []
        },
        refetchInterval: 3000, // Poll every 3s when chatting
    })
}

// 3. Send a message
export function useSendMessage() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
            const token = getToken()
            if (!token) throw new Error("Non connecté")

            const res = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: JSON.stringify({ receiverId, content }),
            })
            if (!res.ok) {
                const err = await res.text()
                throw new Error(err || "Erreur envoi message")
            }
            return res.json()
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ["conversation", variables.receiverId] })
            qc.invalidateQueries({ queryKey: ["inbox"] })
        },
    })
}
