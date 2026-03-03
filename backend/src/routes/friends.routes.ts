import { Router } from "express"
import { getFriendsController } from "../controllers/friends.controller.js"

const router = Router()

router.get("/", getFriendsController)

export default router