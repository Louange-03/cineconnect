import { TanStackDevtools } from "@tanstack/react-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import type { QueryClient } from "@tanstack/react-query"

type Props = {
  queryClient: QueryClient
}

export default function Devtools({ queryClient }: Props) {
  return (
    <>
      <div
        aria-label="TanStack Router badge"
        className="fixed bottom-3 right-3 z-[60] rounded-xl border border-white/25 px-3 py-2 text-xs font-bold text-[#7CFF7A] shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        style={{
          background: "linear-gradient(180deg, #1f2937 0%, #111827 100%)",
        }}
      >
        TanStack Router
      </div>
      <TanStackDevtools
        config={{
          position: "bottom-right",
          hideUntilHover: false,
        }}
        plugins={[
          {
            name: "TanStack Query",
            render: <ReactQueryDevtoolsPanel client={queryClient} />,
          },
        ]}
      />
    </>
  )
}
