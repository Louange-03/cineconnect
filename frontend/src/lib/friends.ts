import { apiClient } from "./apiClient"
import { Friend, FriendRequest } from '../types'

export function fetchFriends(): Promise<{ friends: Friend[] }> {
  return apiClient.get<{ friends: Friend[] }>("/friends")
}

export function fetchFriendRequests(): Promise<{ requests: FriendRequest[] }> {
  return apiClient.get<{ requests: FriendRequest[] }>("/friends/requests")
}

export function sendFriendRequest(targetUserId: number): Promise<any> {
  return apiClient.post("/friends/request", { userId: targetUserId })
}

export function acceptFriendRequest(requesterId: number): Promise<any> {
  return apiClient.post("/friends/accept", { userId: requesterId })
}

export function rejectFriendRequest(requesterId: number): Promise<any> {
  return apiClient.post("/friends/reject", { userId: requesterId })
}
