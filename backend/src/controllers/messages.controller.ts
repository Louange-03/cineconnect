import { eq, sql, desc } from "drizzle-orm"
import type { Request, Response } from "express"
import { z } from "zod"

import { db } from "../db/client.js"
import { messages } from "../db/schema.js"

const createSchema = z.object({
  receiverId: z.string().uuid(),
  content: z.string().min(1).max(2000),
})

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  const senderId = req.user!.id
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid data", errors: parsed.error.issues })
    return
  }
  try {
    const inserted = await db
      .insert(messages)
      .values({ senderId, ...parsed.data })
      .returning()
    res.status(201).json({ message: inserted[0] })
  } catch {
    res.status(500).json({ error: "server" })
  }
}

export const getConversation = async (req: Request, res: Response): Promise<void> => {
  const meId = req.user!.id
  const otherId = req.params.userId as string
  const rows = await db
    .select()
    .from(messages)
    .where(
      sql`(${messages.senderId} = ${meId} AND ${messages.receiverId} = ${otherId}) OR (${messages.senderId} = ${otherId} AND ${messages.receiverId} = ${meId})`
    )
    .orderBy(messages.createdAt)
  res.json({ messages: rows })
}

export const getInbox = async (req: Request, res: Response): Promise<void> => {
  const meId = req.user!.id
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.receiverId, meId))
    .orderBy(desc(messages.createdAt))
  res.json({ messages: rows })
}
