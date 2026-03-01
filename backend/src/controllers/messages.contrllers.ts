import { Request, Response } from "express"
import { db } from "../db/client"
import { messages } from "../db/schema"
import { eq } from "drizzle-orm"

export const sendMessage = async (req: Request, res: Response) => {
  const { conversationId, senderId, text } = req.body

  const [message] = await db
    .insert(messages)
    .values({
      conversationId,
      senderId,
      text
    })
    .returning()

  res.json(message)
}

export const getMessages = async (req: Request, res: Response) => {
  const conversationId = Number(req.params.id)

  const result = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))

  res.json(result)
}