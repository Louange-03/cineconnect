import { pool } from "../db/client.js"
import { isFriend } from "../utils/isFriends"

export async function startConversation(
  userId: string,
  otherUserId: string
) {
  const allowed = await isFriend(userId, otherUserId)
  if (!allowed) throw new Error("Not friends")

  const existing = await pool.query(
    `
    SELECT c.id
    FROM conversations c
    JOIN conversation_members cm1 ON cm1.conversation_id = c.id
    JOIN conversation_members cm2 ON cm2.conversation_id = c.id
    WHERE cm1.user_id = $1 AND cm2.user_id = $2
    `,
    [userId, otherUserId]
  )

  if (existing.rowCount > 0) {
    return existing.rows[0].id
  }

  const conv = await pool.query(
    `INSERT INTO conversations DEFAULT VALUES RETURNING id`
  )

  const conversationId = conv.rows[0].id

  await pool.query(
    `
    INSERT INTO conversation_members (conversation_id, user_id)
    VALUES ($1, $2), ($1, $3)
    `,
    [conversationId, userId, otherUserId]
  )

  return conversationId
}