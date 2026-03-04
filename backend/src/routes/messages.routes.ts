import { Router } from "express"
import { startConversationController } from "../controllers/messages.controllers.js"

const router = Router()
router.post("/start", startConversationController)

export default router
