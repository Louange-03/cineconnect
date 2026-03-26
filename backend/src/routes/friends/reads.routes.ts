import { Router, type Request, type Response } from "express"
import { db } from "../../db/client.js"
import { friendships, users } from "../../db/schema.js"
import { authMiddleware } from "../../middlewares/auth.js"
import { eq, and, sql } from "drizzle-orm"

export const friendsReadsRoutes = Router()

friendsReadsRoutes.get("/", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const meId = req.user?.id

  if (!meId) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const rows = await db.execute(sql`
    select
      u.id,
      u.username,
      u.created_at as "createdAt"
    from friendships f
    join users u on u.id = case
      when f.requester_id = ${meId} then f.addressee_id
      else f.requester_id
    end
    where (f.requester_id = ${meId} or f.addressee_id = ${meId})
      and f.status = 'accepted'
    order by u.username asc
  `)

  res.json({ friends: rows?.rows ?? rows })
})

friendsReadsRoutes.get("/requests", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const meId = req.user?.id

  if (!meId) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const rows = await db
    .select({
      friendshipId: friendships.id,
      fromUserId: users.id,
      fromUsername: users.username,
      createdAt: friendships.createdAt,
    })
    .from(friendships)
    .innerJoin(users, eq(users.id, friendships.requesterId))
    .where(and(eq(friendships.addresseeId, meId), eq(friendships.status, "pending")))
    .orderBy(friendships.createdAt)

  res.json({ requests: rows })
})

friendsReadsRoutes.get("/sent", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const meId = req.user?.id

  if (!meId) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const rows = await db
    .select({
      friendshipId: friendships.id,
      toUserId: users.id,
      toUsername: users.username,
      createdAt: friendships.createdAt,
    })
    .from(friendships)
    .innerJoin(users, eq(users.id, friendships.addresseeId))
    .where(and(eq(friendships.requesterId, meId), eq(friendships.status, "pending")))
    .orderBy(friendships.createdAt)

  res.json({ sent: rows })
})
