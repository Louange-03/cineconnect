import React from "react"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050B1C] text-white">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}