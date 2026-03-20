import { eq, sql } from "drizzle-orm"
import type { Request, Response } from "express"

import { db } from "../db/client.js"
import { users, friendships } from "../db/schema.js"

/* ...existing code... */
export const getFriends = async (req: Request, res: Response): Promise<void> => {
  const meId = req.user!.id

  const rows = await db
    .select({
      friendshipId: friendships.id,
      requesterId: friendships.requesterId,
      addresseeId: friendships.addresseeId,
      status: friendships.status,
      createdAt: friendships.createdAt,
    })
    .from(friendships)
    .where(
      sql`(${friendships.requesterId} = ${meId} OR ${friendships.addresseeId} = ${meId}) AND ${friendships.status} = 'accepted'`
    )

  const friendIds = rows.map((r) => (r.requesterId === meId ? r.addresseeId : r.requesterId))
  const friendUsers =
    friendIds.length > 0
      ? await db
          .select({ id: users.id, username: users.username, email: users.email })
          .from(users)
          .where(sql`${users.id} = ANY(${friendIds})`)
      : []

  res.json({ friends: friendUsers })
}

export const getPendingRequests = async (req: Request, res: Response): Promise<void> => {
  const meId = req.user!.id

  const rows = await db
    .select({
      id: friendships.id,
      requesterId: friendships.requesterId,
      addresseeId: friendships.addresseeId,
      status: friendships.status,
      createdAt: friendships.createdAt,
    })
    .from(friendships)
    .where(sql`${friendships.addresseeId} = ${meId} AND ${friendships.status} = 'pending'`)

  const requesterIds = rows.map((r) => r.requesterId)
  const requesterUsers =
    requesterIds.length > 0
      ? await db
          .select({ id: users.id, username: users.username, email: users.email })
          .from(users)
          .where(sql`${users.id} = ANY(${requesterIds})`)
      : []
  const userMap = new Map(requesterUsers.map((u) => [u.id, u]))

  res.json({
    requests: rows.map((r) => ({
      friendshipId: r.id,
      fromUserId: r.requesterId,
      fromUsername: userMap.get(r.requesterId)?.username ?? "Utilisateur",
      email: userMap.get(r.requesterId)?.email ?? "",
      sentAt: r.createdAt,
    })),
  })
}

export const getSentRequests = async (req: Request, res: Response): Promise<void> => {
  const meId = req.user!.id

  const rows = await db
    .select({
      friendshipId: friendships.id,
      toUserId: friendships.addresseeId,
      createdAt: friendships.createdAt,
    })
    .from(friendships)
    .where(sql`${friendships.requesterId} = ${meId} AND ${friendships.status} = 'pending'`)

  const toIds = rows.map((r) => r.toUserId)
  const usersRows =
    toIds.length > 0
      ? await db
          .select({ id: users.id, username: users.username })
          .from(users)
          .where(sql`${users.id} = ANY(${toIds})`)
      : []
  const userMap = new Map(usersRows.map((u) => [u.id, u.username]))

  res.json({
    sent: rows.map((r) => ({
      friendshipId: r.friendshipId,
      toUserId: r.toUserId,
      toUsername: userMap.get(r.toUserId) ?? "Utilisateur",
      sentAt: r.createdAt,
    })),
  })
}

export const sendFriendRequest = async (req: Request, res: Response): Promise<void> => {
  const meId = req.user!.id
  const userId = req.body.userId as string | undefined

  if (!userId) {
    res.status(400).json({ error: "userId missing" })
    return
  }

  if (userId === meId) {
    res.status(400).json({ error: "cannot friend yourself" })
    return
  }

  try {
    const other = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1)
    if (!other[0]) {
      res.status(404).json({ error: "user not found" })
      return
    }

    // Check if already exist
    const existing = await db
      .select()
      .from(friendships)
      .where(
        sql`(${friendships.requesterId} = ${meId} AND ${friendships.addresseeId} = ${userId}) OR (${friendships.requesterId} = ${userId} AND ${friendships.addresseeId} = ${meId})`
      )
      .limit(1)

    if (existing.length > 0) {
      res.status(400).json({ error: "friendship already exists" })
      return
    }

    const inserted = await db
      .insert(friendships)
      .values({ requesterId: meId, addresseeId: userId, status: "pending" })
      .returning()

    res.status(201).json({ status: "pending", friendship: inserted[0] })
  } catch {
    res.status(500).json({ error: "server" })
  }
}

export const respondFriendRequest = async (req: Request, res: Response): Promise<void> => {
  const meId = req.user!.id
  const friendshipId = req.params.id as string | undefined
  const action = req.body.action as string | undefined

  if (!friendshipId || !action) {
    res.status(400).json({ error: "friendshipId or action missing" })
    return
  }

  if (!["accept", "reject"].includes(action)) {
    res.status(400).json({ error: "action must be accept or reject" })
    return
  }

  try {
    const friendship = await db.select().from(friendships).where(eq(friendships.id, friendshipId)).limit(1)

    if (!friendship[0]) {
      res.status(404).json({ error: "friendship not found" })
      return
    }

    if (friendship[0].addresseeId !== meId) {
      res.status(403).json({ error: "not authorized" })
      return
    }

    if (action === "accept") {
      const updated = await db
        .update(friendships)
        .set({ status: "accepted", updatedAt: sql`now()` })
        .where(eq(friendships.id, friendshipId))
        .returning()

      res.json({ status: "accepted", friendship: updated[0] })
    } else {
      const updated = await db
        .update(friendships)
        .set({
          status: "rejected",
          updatedAt: sql`now()`,
        })
        .where(eq(friendships.id, friendshipId))
        .returning()

      res.json({ status: "pending", friendship: updated[0] })
    }
  } catch {
    res.status(500).json({ error: "server" })
  }
}

export const acceptFriendRequestByUser = async (req: Request, res: Response): Promise<void> => {
  const meId = req.user!.id
  const userId = req.body.userId as string | undefined
  if (!userId) {
    res.status(400).json({ error: "userId missing" })
    return
  }

  const updated = await db
    .update(friendships)
    .set({ status: "accepted", updatedAt: sql`now()` })
    .where(
      sql`${friendships.requesterId} = ${userId} AND ${friendships.addresseeId} = ${meId} AND ${friendships.status} = 'pending'`
    )
    .returning()

  if (!updated.length) {
    res.status(404).json({ error: "request not found" })
    return
  }
  res.json({ status: "accepted", friendship: updated[0] })
}

export const rejectFriendRequestByUser = async (req: Request, res: Response): Promise<void> => {
  const meId = req.user!.id
  const userId = req.body.userId as string | undefined
  if (!userId) {
    res.status(400).json({ error: "userId missing" })
    return
  }

  const updated = await db
    .update(friendships)
    .set({ status: "rejected", updatedAt: sql`now()` })
    .where(
      sql`${friendships.requesterId} = ${userId} AND ${friendships.addresseeId} = ${meId} AND ${friendships.status} = 'pending'`
    )
    .returning()

  if (!updated.length) {
    res.status(404).json({ error: "request not found" })
    return
  }
  res.json({ status: "rejected", friendship: updated[0] })
}

export const removeFriend = async (req: Request, res: Response): Promise<void> => {
  const meId = req.user!.id
  const friendshipId = req.params.id as string | undefined

  if (!friendshipId) {
    res.status(400).json({ error: "friendshipId missing" })
    return
  }

  try {
    const updated = await db
      .update(friendships)
      .set({ status: "rejected", updatedAt: sql`now()` })
      .where(
        sql`(${friendships.id} = ${friendshipId}
              OR ((${friendships.requesterId} = ${meId} AND ${friendships.addresseeId} = ${friendshipId})
               OR (${friendships.requesterId} = ${friendshipId} AND ${friendships.addresseeId} = ${meId})))
             AND ${friendships.status} IN ('accepted','pending')`
      )
      .returning()

    if (updated.length === 0) {
      res.status(404).json({ error: "friendship not found" })
      return
    }

    res.json({ message: "friend removed", friendship: updated[0] })
  } catch {
    res.status(500).json({ error: "server" })
  }
}
/* ...existing code... */

