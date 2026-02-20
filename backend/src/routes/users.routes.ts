import { Router } from "express"
import { authMiddleware } from "../middlewares/auth.js"
import { getUsers, searchUsers } from "../controllers/users.controller.js"

const router = Router()

// GET /users?limit=20
router.get("/", authMiddleware, getUsers)

// GET /users/search?q=abc
router.get("/search", authMiddleware, searchUsers)

export default router