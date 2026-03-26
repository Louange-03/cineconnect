import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { router } from "./router"
import { initTheme } from "./lib/theme"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const Devtools = import.meta.env.DEV ? React.lazy(() => import("./devtools")) : null

initTheme()

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
