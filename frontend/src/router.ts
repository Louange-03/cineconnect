import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router"

import { AppLayout } from "./components/layout/AppLayout"
import { isAuthenticated } from "./lib/auth.ts"

import { Home } from "./pages/Home"
import { Films } from "./pages/Films"
import { FilmDetail } from "./pages/FilmDetail"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { Profil } from "./pages/Profil"
import { Discussion } from "./pages/Discussion"
import { Amis } from "./pages/Amis"
import { Utilisateurs } from "./pages/Utilisateurs"

const rootRoute = createRootRoute({
  component: AppLayout,
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

const amisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/amis",
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" })
    }
  },
  component: Amis,
})

const utilisateursRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/utilisateurs",
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" })
    }
  },
  component: Utilisateurs,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  filmsRoute,
  filmDetailRoute,
  amisRoute,
  utilisateursRoute,
  loginRoute,
  registerRoute,
  profilRoute,
  discussionRoute,
])

export const router = createRouter({ routeTree })
