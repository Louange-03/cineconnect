import { Router, type Request, type Response } from "express"
import { db } from "../../db"
import { users } from "../../db/schema"
import { authMiddleware } from "../../middlewares/auth"
import { ilike, and, ne } from "drizzle-orm"

export const usersDirectoryRoutes = Router()

usersDirectoryRoutes.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const meId = req.user!.id
    const list = await db
      .select({ id: users.id, email: users.email, username: users.username, createdAt: users.createdAt })
      .from(users)
      .where(ne(users.id, meId))
      .limit(200)

    res.json({ users: list })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Erreur récupération utilisateurs" })
  }
})

usersDirectoryRoutes.get("/search", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const meId = req.user!.id
  const q = (req.query.q ?? "").toString().trim()

  if (!q) {
    res.json({ users: [] })
    return
  }

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(ne(users.id, meId), ilike(users.username, `%${q}%`)))
    .limit(50)

  res.json({ users: rows })
})
