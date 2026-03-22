import React from "react"
import { Outlet } from "@tanstack/react-router"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#050B1C] text-white cine-bg">
      {/* Floating cinematic orbs */}
      <div className="cine-orb cine-orb--blue" aria-hidden="true" />
      <div className="cine-orb cine-orb--gold" aria-hidden="true" />

      <Navbar />
      <main className="pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}