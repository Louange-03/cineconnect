import { Router } from "express"

import {
    getFriends,
    getPendingRequests,
    sendFriendRequest,
    respondFriendRequest,
    removeFriend
} from "../controllers/friends.controller"

const router = Router()

router.get("/", getFriends)
router.get("/pending", getPendingRequests)
router.post("/request", sendFriendRequest)
router.post("/respond/:id", respondFriendRequest)
router.delete("/:id", removeFriend)

export default router