import { Router } from "express"
import { authMiddleware } from "../middlewares/auth.js"
import { getFriends, getPendingRequests, sendFriendRequest, respondFriendRequest, removeFriend } from "../controllers/friends.controller.js"

const router = Router()

// GET /friends -> amis (accepted)
router.get("/", authMiddleware, getFriends)

// GET /friends/requests -> demandes reçues (pending)
router.get("/requests", authMiddleware, getPendingRequests)

// POST /friends/request { userId }
router.post("/request", authMiddleware, sendFriendRequest)

// POST /friends/accept { id }
router.post("/accept/:id", authMiddleware, respondFriendRequest)

// POST /friends/reject { id }
router.post("/reject/:id", authMiddleware, respondFriendRequest)

// DELETE /friends/:id
router.delete("/:id", authMiddleware, removeFriend)

export default router
