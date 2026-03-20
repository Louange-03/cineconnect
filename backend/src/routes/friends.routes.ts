import { Router } from "express"

import {
    getFriends,
    getPendingRequests,
    getSentRequests,
    sendFriendRequest,
    respondFriendRequest,
    acceptFriendRequestByUser,
    rejectFriendRequestByUser,
    removeFriend
} from "../controllers/friends.controller"

import { authMiddleware } from "../middlewares/auth"

const router = Router()

router.use(authMiddleware)

router.get("/", getFriends)
router.get("/pending", getPendingRequests)
router.get("/requests", getPendingRequests)
router.get("/sent", getSentRequests)
router.post("/request", sendFriendRequest)
router.post("/respond/:id", respondFriendRequest)
router.post("/accept", acceptFriendRequestByUser)
router.post("/reject", rejectFriendRequestByUser)
router.delete("/:id", removeFriend)

export default router