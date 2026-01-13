import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router"
import { AppLayout } from "./components/layout/AppLayout"
import { isAuthenticated } from "./lib/auth"

import { Home } from "./pages/Home"
import { Films } from "./pages/Films"
import { FilmDetail } from "./pages/FilmDetail"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { Profil } from "./pages/Profil"
import { Discussion } from "./pages/Discussion"

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
})

const filmsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/films",
  component: Films,
})

const filmDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/film/$id",
  component: FilmDetail,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: Register,
})

const profilRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profil",
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" })
    }
  },
  component: Profil,
})

const discussionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/discussion",
  component: Discussion,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  filmsRoute,
  filmDetailRoute,
  loginRoute,
  registerRoute,
  profilRoute,
  discussionRoute,
])

export const router = createRouter({ routeTree })
