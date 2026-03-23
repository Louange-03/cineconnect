import { Router, Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { pool } from "../db/client.js"

const router = Router()

/* =========================
   AUTH MIDDLEWARE REST
========================= */
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id?: string; userId?: string; email?: string; username?: string }
    const id = decoded.id ?? decoded.userId
    if (!id) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    req.user = { ...decoded, id }
    next()
  } catch {
    return res.status(401).json({ error: "Unauthorized" })
  }
}

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  const userId = req.user!.id

  try {
    const result = await pool.query(
      `
      SELECT
        c.id,
        COALESCE(c.name, other_user.username, 'Inconnu') AS name,
        c.created_at,
        c.updated_at,
        COALESCE(last_msg.text, '') AS last_message
      FROM conversations c
      JOIN conversation_members cm ON cm.conversation_id = c.id
      LEFT JOIN LATERAL (
        SELECT u.username
        FROM conversation_members cm2
        JOIN users u ON u.id = cm2.user_id
        WHERE cm2.conversation_id = c.id
          AND cm2.user_id <> $1
        ORDER BY u.username ASC
        LIMIT 1
      ) other_user ON true
      LEFT JOIN LATERAL (
        SELECT m.text, m.created_at
        FROM messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) last_msg ON true
      WHERE cm.user_id = $1
      ORDER BY COALESCE(last_msg.created_at, c.updated_at) DESC
      `,
      [userId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error("Get conversations error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

/* =========================
   GET MESSAGES HISTORY
========================= */
router.get(
  "/:id/messages",
  authMiddleware,
  async (req: Request, res: Response) => {
    const conversationId = req.params.id
    const userId = req.user!.id

    const limit = parseInt(req.query.limit as string) || 20
    const cursor = req.query.cursor as string | undefined

    try {
      // Vérifier appartenance
      const memberCheck = await pool.query(
        `
        SELECT 1 FROM conversation_members
        WHERE conversation_id = $1 AND user_id = $2
        `,
        [conversationId, userId]
      )

      if (memberCheck.rowCount === 0) {
        return res.status(403).json({ error: "Forbidden" })
      }

      let query = `
        SELECT * FROM messages
        WHERE conversation_id = $1
      `
      const values: unknown[] = [conversationId]

      if (cursor) {
        query += ` AND created_at < $2`
        values.push(cursor)
      }

      query += `
        ORDER BY created_at DESC
        LIMIT ${limit}
      `

      const result = await pool.query(query, values)

      // On inverse pour renvoyer du plus ancien au plus récent
      const messages = result.rows.reverse()

      res.json(messages)
    } catch (error) {
      console.error("Get messages error:", error)
      res.status(500).json({ error: "Server error" })
    }
  }
)

export default router