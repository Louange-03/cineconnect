import { pool } from "../db/client.js"

export async function getFriends(userId: string) {
  const result = await pool.query(
    `
    SELECT u.id, u.username, u.email
    FROM friendships f
    JOIN users u
      ON (u.id = f.receiver_id AND f.requester_id = $1)
      OR (u.id = f.requester_id AND f.receiver_id = $1)
    WHERE f.status = 'accepted'
    `,
    [userId]
  )

  return result.rows
}