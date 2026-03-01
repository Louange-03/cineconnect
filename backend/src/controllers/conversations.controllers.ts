import { Request, Response } from "express"
import { db } from "../db/client"
import { conversations, conversationMembers } from "../db/schema"

export const createConversation = async (req: Request, res: Response) => {
  const { memberIds } = req.body

  if (!memberIds || memberIds.length < 2) {
    return res.status(400).json({ message: "Minimum 2 members required" })
  }

  const [conversation] = await db
    .insert(conversations)
    .values({})
    .returning()

  await db.insert(conversationMembers).values(
    memberIds.map((id: number) => ({
      conversationId: conversation.id,
      userId: id
    }))
  )

  res.json(conversation)
}