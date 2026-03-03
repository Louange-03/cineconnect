import { Router } from "express"
import { db } from "../db"
import { users } from "../db/schema"

export const usersRoutes = Router()

usersRoutes.get("/", async (_req, res) => {
    try {
        const list = await db
            .select({ id: users.id, email: users.email, username: users.username, createdAt: users.createdAt })
            .from(users)
            .limit(200)

        res.json({ users: list })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Erreur récupération utilisateurs" })
    }
})