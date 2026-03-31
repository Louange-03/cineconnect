import { TanStackDevtools } from "@tanstack/react-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import {
  TanStackRouterDevtoolsInProd,
  TanStackRouterDevtoolsPanelInProd,
} from "@tanstack/react-router-devtools"
import type { QueryClient } from "@tanstack/react-query"

type Props = {
  queryClient: QueryClient
}

export default function Devtools({ queryClient }: Props) {
  return (
    <>
      <TanStackRouterDevtoolsInProd
        position="bottom-right"
        toggleButtonProps={{
          style: {
            marginRight: 16,
            marginBottom: 14,
            borderRadius: 12,
            padding: "8px 12px",
            border: "1px solid rgba(255,255,255,0.25)",
            background: "linear-gradient(180deg, #1f2937 0%, #111827 100%)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
            color: "#7CFF7A",
            fontWeight: 700,
            fontSize: 12,
          },
        }}
      />
      <TanStackDevtools
        config={{ position: "bottom-right", hideUntilHover: false }}
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanelInProd />,
          },
          {
            name: "TanStack Query",
            render: <ReactQueryDevtoolsPanel client={queryClient} />,
          },
        ]}
      />
    </>
  )
}
