import { Router } from "express"
import jwt from "jsonwebtoken"
import { pool } from "../db/client.js"

const router = Router()

/* =========================
   AUTH MIDDLEWARE REST
========================= */
function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string }

    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: "Unauthorized" })
  }
}

/* =========================
   GET MESSAGES HISTORY
========================= */
router.get(
  "/:id/messages",
  authMiddleware,
  async (req: any, res) => {
    const conversationId = req.params.id
    const userId = req.user.id

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
      const values: any[] = [conversationId]

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