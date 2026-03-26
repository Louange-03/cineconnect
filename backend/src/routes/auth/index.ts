import { Router } from "express"
import { sessionAuthRoutes } from "./session.routes.js"
import { passwordAuthRoutes } from "./password.routes.js"

export const authRoutes = Router()
authRoutes.use(sessionAuthRoutes)
authRoutes.use(passwordAuthRoutes)
