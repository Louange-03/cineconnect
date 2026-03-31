import { TanStackDevtools } from "@tanstack/react-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import type { QueryClient } from "@tanstack/react-query"

type Props = {
  queryClient: QueryClient
}

export default function Devtools({ queryClient }: Props) {
  return (
    <TanStackDevtools
      config={{ position: "bottom-right", hideUntilHover: false }}
      plugins={[
        {
          name: "TanStack Router",
          render: <TanStackRouterDevtoolsPanel />,
        },
        {
          name: "TanStack Query",
          render: <ReactQueryDevtoolsPanel client={queryClient} />,
        },
      ]}
    />
  )
}
