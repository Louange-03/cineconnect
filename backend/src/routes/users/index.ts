import { Router } from "express"
import { usersDirectoryRoutes } from "./directory.routes.js"
import { usersFavoritesRoutes } from "./favorites.routes.js"
import { usersAccountRoutes } from "./account.routes.js"

export const usersRoutes = Router()
usersRoutes.use(usersDirectoryRoutes)
usersRoutes.use(usersFavoritesRoutes)
usersRoutes.use(usersAccountRoutes)

export default usersRoutes
