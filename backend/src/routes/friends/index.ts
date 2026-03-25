import { Router } from "express"
import { friendsReadsRoutes } from "./reads.routes.js"
import { friendsWritesRoutes } from "./writes.routes.js"

const friendsRoutes = Router()
friendsRoutes.use(friendsReadsRoutes)
friendsRoutes.use(friendsWritesRoutes)

export default friendsRoutes
