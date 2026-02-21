import { Router } from "express"
import { authMiddleware } from "../middlewares/auth.js"
import { sendMessage, getConversation, getInbox } from "../controllers/messages.controller.js"

const router = Router()

// POST /messages -> send
router.post("/", authMiddleware, sendMessage)

// GET /messages/inbox -> messages received
router.get("/inbox", authMiddleware, getInbox)

// GET /messages/conversation/:userId
router.get("/conversation/:userId", authMiddleware, getConversation)

export default router
