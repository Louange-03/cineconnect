export interface FriendRequest {
  id: string
  requester_id: string
  receiver_id: string
  status: "pending" | "accepted" | "rejected"
  created_at: Date
}