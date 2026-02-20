import { eq, sql } from "drizzle-orm"
import type { Request, Response } from "express"

import { db } from "../db/client.js"
import { users, friendships } from "../db/schema.js"

export const getFriends = async (req: Request, res: Response): Promise<void> => {
  const meId = req.user!.id

  const select = {
    id: friendships.id,
    senderId: friendships.senderId,
    receiverId: friendships.receiverId,
    status: friendships.status,
    createdAt: friendships.createdAt,
  }

  const rows = await db
    .select(select)
    .from(friendships)
    .where(
      sql`(${friendships.senderId} = ${meId} OR ${friendships.receiverId} = ${meId}) AND ${friendships.status} = 'accepted'`
    )

  res.json({ friendships: rows })
}

export const getPendingRequests = async (req: Request, res: Response): Promise<void> => {
  const meId = req.user!.id

  const rows = await db
    .select({
      id: friendships.id,
      senderId: friendships.senderId,
      receiverId: friendships.receiverId,
      status: friendships.status,
      createdAt: friendships.createdAt,
    })
    .from(friendships)
    .where(sql`${friendships.receiverId} = ${meId} AND ${friendships.status} = 'pending'`)

  res.json({ requests: rows })
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
        sql`(${friendships.senderId} = ${meId} AND ${friendships.receiverId} = ${userId}) OR (${friendships.senderId} = ${userId} AND ${friendships.receiverId} = ${meId})`
      )
      .limit(1)

    if (existing.length > 0) {
      res.status(400).json({ error: "friendship already exists" })
      return
    }

    const inserted = await db
      .insert(friendships)
      .values({ senderId: meId, receiverId: userId, status: "pending" })
      .returning()

    res.status(201).json({ status: "pending", friendship: inserted[0] })
  } catch (e) {
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

    if (friendship[0].receiverId !== meId) {
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
  } catch (e) {
    res.status(500).json({ error: "server" })
  }
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
      .where(eq(friendships.id, friendshipId))
      .returning()

    if (updated.length === 0) {
      res.status(404).json({ error: "friendship not found" })
      return
    }

    res.json({ message: "friend removed", friendship: updated[0] })
  } catch (e) {
    res.status(500).json({ error: "server" })
  }
}
