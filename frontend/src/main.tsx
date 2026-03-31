import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { router } from "./router"
import { initTheme } from "./lib/theme"
import { bootstrapPushNotifications } from "./lib/pushNotifications"
import { readViteEnv } from "./lib/viteEnv"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const enableDevtools = import.meta.env.DEV || readViteEnv("VITE_ENABLE_DEVTOOLS") === "true"
const Devtools = enableDevtools ? React.lazy(() => import("./devtools")) : null

initTheme()
bootstrapPushNotifications()

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {Devtools ? (
        <React.Suspense fallback={null}>
          <Devtools queryClient={queryClient} />
        </React.Suspense>
      ) : null}
    </QueryClientProvider>
  </React.StrictMode>
)
