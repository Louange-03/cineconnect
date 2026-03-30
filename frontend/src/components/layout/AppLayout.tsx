import React from "react"
import { Outlet, useRouterState } from "@tanstack/react-router"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"

export function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isHome = pathname === "/"
  const isDiscussion = pathname.startsWith("/discussion")

  return (
    <div
      className={[
        "min-h-screen text-white antialiased",
        isHome ? "app-shell-home bg-[#050B1C]" : "bg-[#050B1C] cine-bg",
      ].join(" ")}
    >
      {/* Orbes : masqués sur l’accueil (maquette plein écran) */}
      {!isHome && (
        <>
          <div className="cine-orb cine-orb--blue" aria-hidden="true" />
          <div className="cine-orb cine-orb--gold" aria-hidden="true" />
        </>
      )}

      <Navbar />
      <main className={["pt-20", isDiscussion ? "min-h-[calc(100dvh-5rem)]" : ""].join(" ")}>
        <Outlet />
      </main>
      {!isDiscussion ? <Footer /> : null}
    </div>
  )
}
