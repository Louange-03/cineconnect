import { Router } from "express"
import { startConversationController } from "../controllers/messages.controllers.js"
import { authMiddleware } from "../middlewares/auth.js"

const router = Router()
router.post("/start", authMiddleware, startConversationController)

export default router
