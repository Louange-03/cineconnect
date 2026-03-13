import React from "react"
import { Outlet } from "@tanstack/react-router"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#050B1C] text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}