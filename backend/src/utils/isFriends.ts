import { pool } from "../db/client.js"

export async function isFriend(
  userId: string,
  otherUserId: string
): Promise<boolean> {
  const result = await pool.query(
    `
    SELECT 1 FROM friendships
    WHERE 
      ((requester_id = $1 AND addressee_id = $2)
      OR (requester_id = $2 AND addressee_id = $1))
      AND status = 'accepted'
    `,
    [userId, otherUserId]
  )

  return result.rows.length > 0
}