import { eq, sql } from "drizzle-orm"
import type { Request, Response } from "express"

import { db } from "../db/client.js"
import { users, friendships } from "../db/schema.js"
import { getFriends } from "../services/Friends.service.js"

export async function getFriendsController(
  req: Request,
  res: Response
) {
  const friends = await getFriends(req.user.id)
  res.json({ friends })
}