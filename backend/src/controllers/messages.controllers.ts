import { Request, Response } from "express"
import { startConversation } from "../services/message.service"

export async function startConversationController(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user.id
    const { userId: otherUserId } = req.body

    const conversationId = await startConversation(
      userId,
      otherUserId
    )

    res.json({ conversationId })
  } catch (error) {
    res.status(400).json({ error: "Cannot start conversation" })
  }
}