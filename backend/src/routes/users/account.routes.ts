import { Router, type Request, type Response } from "express"
import { db } from "../../db"
import { users } from "../../db/schema"
import { authMiddleware } from "../../middlewares/auth"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export const usersAccountRoutes = Router()

usersAccountRoutes.patch("/me", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const meId = req.user!.id
  const { email, password } = req.body ?? {}

  if (!email && !password) {
    res.status(400).json({ message: "Rien à mettre à jour" })
    return
  }

  const updates: Partial<{ email: string; passwordHash: string }> = {}

  if (email) {
    const trimmed = email.toString().trim()
    if (!trimmed.includes("@")) {
      res.status(400).json({ message: "Email invalide" })
      return
    }
    updates.email = trimmed
  }

  if (password) {
    if (password.length < 6) {
      res.status(400).json({ message: "Le mot de passe doit faire au moins 6 caractères" })
      return
    }
    updates.passwordHash = await bcrypt.hash(password, 10)
  }

  const updated = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, meId))
    .returning({
      id: users.id,
      email: users.email,
      username: users.username,
    })

  res.json({ user: updated[0] })
})

usersAccountRoutes.put("/me/password", authMiddleware, async (req: Request, res: Response) => {
  try {
    res.json({ success: true })
  } catch {
    res.status(500).json({ message: "Erreur password" })
  }
})

usersAccountRoutes.delete("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const meId = req.user!.id
    await db.delete(users).where(eq(users.id, meId))
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.json({ success: true })
  }
})
