import { Router } from "express"
import { db } from "../db"
import { messages } from "../db/schema"
import { eq, and, desc } from "drizzle-orm"

export const messagesRoutes = Router()

// Inbox: GET /api/messages/inbox?userId=...
messagesRoutes.get("/inbox", async (req, res) => {
    try {
        const userId = typeof req.query.userId === "string" ? req.query.userId : ""
        if (!userId) return res.status(400).json({ message: "userId requis" })

        const rows = await db
            .select()
            .from(messages)
            .where(eq(messages.receiverId, userId))
            .orderBy(desc(messages.createdAt))
            .limit(200)

        res.json({ messages: rows })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Erreur inbox" })
    }
})

// Conversation: GET /api/messages/thread?me=...&other=...
messagesRoutes.get("/thread", async (req, res) => {
    try {
        const me = typeof req.query.me === "string" ? req.query.me : ""
        const other = typeof req.query.other === "string" ? req.query.other : ""
        if (!me || !other) return res.status(400).json({ message: "me et other requis" })

        const rows = await db
            .select()
            .from(messages)
            .where(
                and(
                    // simple : messages envoyés et reçus
                    // (on fera un OR plus tard si tu veux la conversation complète)
                    eq(messages.senderId, me),
                    eq(messages.receiverId, other)
                )
            )
            .orderBy(desc(messages.createdAt))
            .limit(200)

        res.json({ messages: rows })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Erreur thread" })
    }
})

// Send message
messagesRoutes.post("/", async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body ?? {}
        if (!senderId || !receiverId || !content) {
            return res.status(400).json({ message: "senderId, receiverId, content requis" })
        }

        const inserted = await db
            .insert(messages)
            .values({ senderId, receiverId, content: String(content), read: false })
            .returning()

        res.json({ message: inserted[0] })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Erreur envoi message" })
    }
})