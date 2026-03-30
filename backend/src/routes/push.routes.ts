import { Router } from "express"
import { pool } from "../db/client"
import { authMiddleware } from "../middlewares/auth"
import { getPushPublicKey, isPushConfigured } from "../utils/push"

export const pushRoutes = Router()

pushRoutes.get("/public-key", (_req, res) => {
  const key = getPushPublicKey()
  if (!key) {
    res.status(404).json({ message: "Push non configuré" })
    return
  }
  res.json({ publicKey: key })
})

pushRoutes.post("/subscriptions", authMiddleware, async (req, res) => {
  const userId = req.user?.id
  const endpoint = String(req.body?.endpoint ?? "").trim()
  const p256dh = String(req.body?.keys?.p256dh ?? "").trim()
  const auth = String(req.body?.keys?.auth ?? "").trim()

  if (!userId) {
    res.status(401).json({ message: "Non autorisé" })
    return
  }
  if (!endpoint || !p256dh || !auth) {
    res.status(400).json({ message: "Abonnement push invalide" })
    return
  }
  if (!isPushConfigured()) {
    res.status(503).json({ message: "Push non configuré serveur" })
    return
  }

  try {
    await pool.query(
      `
      INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (endpoint)
      DO UPDATE SET
        user_id = EXCLUDED.user_id,
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        updated_at = NOW()
      `,
      [userId, endpoint, p256dh, auth],
    )
    res.status(201).json({ ok: true })
  } catch (e) {
    console.error("[push] save subscription failed:", e)
    res.status(500).json({ message: "Erreur enregistrement notification" })
  }
})

pushRoutes.delete("/subscriptions", authMiddleware, async (req, res) => {
  const userId = req.user?.id
  const endpoint = String(req.body?.endpoint ?? "").trim()
  if (!userId) {
    res.status(401).json({ message: "Non autorisé" })
    return
  }
  if (!endpoint) {
    res.status(400).json({ message: "endpoint requis" })
    return
  }
  try {
    await pool.query(`DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2`, [userId, endpoint])
    res.json({ ok: true })
  } catch (e) {
    console.error("[push] delete subscription failed:", e)
    res.status(500).json({ message: "Erreur suppression notification" })
  }
})

