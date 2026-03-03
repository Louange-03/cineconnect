import { Router } from "express"
import { db } from "../db"
import { friendships } from "../db/schema"
import { eq, and } from "drizzle-orm"

export const friendsRoutes = Router()

// Liste (simple) : toutes les demandes d’un user (à sécuriser plus tard avec JWT)
friendsRoutes.get("/", async (req, res) => {
    try {
        const userId = typeof req.query.userId === "string" ? req.query.userId : ""
        if (!userId) return res.status(400).json({ message: "userId requis" })

        const rows = await db
            .select()
            .from(friendships)
            .where(eq(friendships.requesterId, userId))
            .limit(200)

        res.json({ friendships: rows })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Erreur récupération amis" })
    }
})

// Envoyer une demande
friendsRoutes.post("/request", async (req, res) => {
    try {
        const { requesterId, addresseeId } = req.body ?? {}
        if (!requesterId || !addresseeId) {
            return res.status(400).json({ message: "requesterId et addresseeId requis" })
        }

        const inserted = await db
            .insert(friendships)
            .values({
                requesterId,
                addresseeId,
                status: "pending",
            })
            .returning()

        res.json({ friendship: inserted[0] })
    } catch (err: any) {
        const msg = String(err?.message || err)
        if (msg.toLowerCase().includes("unique")) {
            return res.status(409).json({ message: "Demande déjà envoyée" })
        }
        console.error(err)
        res.status(500).json({ message: "Erreur demande ami" })
    }
})

// Accepter une demande (simple)
friendsRoutes.post("/accept", async (req, res) => {
    try {
        const { requesterId, addresseeId } = req.body ?? {}
        if (!requesterId || !addresseeId) {
            return res.status(400).json({ message: "requesterId et addresseeId requis" })
        }

        const updated = await db
            .update(friendships)
            .set({ status: "accepted" })
            .where(and(eq(friendships.requesterId, requesterId), eq(friendships.addresseeId, addresseeId)))
            .returning()

        res.json({ friendship: updated[0] ?? null })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Erreur acceptation" })
    }
})