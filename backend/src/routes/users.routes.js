import { Router } from "express"
import { db } from "../db/client.js"
import { users } from "../db/schema.js"
import { authMiddleware } from "../middlewares/auth.js"

const router = Router()

// GET /users -> liste (sans passwordHash)
router.get("/", authMiddleware, async (req, res) => {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      createdAt: users.createdAt,
    })
    .from(users)

  res.json({ users: rows })
})

export default router
