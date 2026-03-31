import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { router } from "./router"

export default function Devtools() {
  return (
    <TanStackRouterDevtools
      router={router}
      position="bottom-right"
      panelProps={{
        style: {
          width: "min(100vw, 980px)",
          height: "min(56vh, 520px)",
          zIndex: 99999,
        },
      }}
      toggleButtonProps={{
        style: {
          right: "16px",
          bottom: "14px",
          borderRadius: "16px",
          border: "1px solid rgba(110,132,174,0.75)",
          background: "linear-gradient(180deg,#131a2a 0%,#0b111d 100%)",
          color: "#53f16f",
          fontWeight: 800,
          letterSpacing: "0.2px",
          padding: "10px 16px",
          boxShadow: "0 12px 28px rgba(0,0,0,0.45)",
        },
        children: (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span
              aria-hidden
              style={{
                width: 28,
                height: 28,
                borderRadius: "999px",
                display: "inline-grid",
                placeItems: "center",
                background: "radial-gradient(circle at 30% 30%, #fde68a, #22c55e 68%)",
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              🌴
            </span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>TanStack Router</span>
          </span>
        ),
      }}
    />
  )
}
