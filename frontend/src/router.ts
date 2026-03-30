import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router"

import { AppLayout } from "./components/layout/AppLayout"
import { isAuthenticated } from "./lib/auth"

import { Home } from "./pages/Home"
import { Films } from "./pages/Films"
import { FilmDetail } from "./pages/FilmDetail"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { ForgotPassword } from "./pages/ForgotPassword"
import { ResetPassword } from "./pages/ResetPassword"
import { Profil } from "./pages/Profil"
import { Discussion } from "./pages/Discussions"
import { Amis } from "./pages/Amis"
import { Utilisateurs } from "./pages/Utilisateurs"
import { Settings } from "./pages/Settings"

type FilmsSearch = {
  q: string
  category: string
  type: "movie" | "series" | "all"
  sort: "" | "viewed" | "popular" | "recent"
}

const requireAuth = () => {
  if (!isAuthenticated()) {
    throw redirect({ to: "/login" })
  }
}

export const rootRoute = createRootRoute({
  component: AppLayout,
})

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
})

export const filmsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/films",
  validateSearch: (search: Record<string, unknown>): FilmsSearch => {
    const q = typeof search.q === "string" ? search.q : ""
    const category = typeof search.category === "string" ? search.category : ""

    const rawType = typeof search.type === "string" ? search.type : "all"
    const type: FilmsSearch["type"] =
      rawType === "movie" || rawType === "series" ? rawType : "all"

    const rawSort = typeof search.sort === "string" ? search.sort : ""
    const sort: FilmsSearch["sort"] =
      rawSort === "viewed" || rawSort === "popular" || rawSort === "recent"
        ? rawSort
        : ""

    return { q, category, type, sort }
  },
  component: Films,
})

export const filmDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/film/$id",
  component: FilmDetail,
})

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
})

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: Register,
})

export const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: ForgotPassword,
})

export const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reset-password/$token",
  component: ResetPassword,
})

export const profilRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profil",
  beforeLoad: requireAuth,
  component: Profil,
})

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  beforeLoad: () => {
    if (!isAuthenticated()) throw redirect({ to: "/login" })
  },
  component: Settings,
})

export const discussionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/discussion",
  component: Discussion,
})

export const amisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/amis",
  beforeLoad: requireAuth,
  component: Amis,
})

export const utilisateursRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/utilisateurs",
  beforeLoad: requireAuth,
  component: Utilisateurs,
})

export const routeTree = rootRoute.addChildren([
  indexRoute,
  filmsRoute,
  filmDetailRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  profilRoute,
  discussionRoute,
  amisRoute,
  utilisateursRoute,
  settingsRoute,
])

export const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}