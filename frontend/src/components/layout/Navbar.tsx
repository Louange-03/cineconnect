import React from "react"
import { Link, useRouterState } from "@tanstack/react-router"

function NavItem({ to, label }: { to: string; label: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const active = pathname === to || (to !== "/" && pathname.startsWith(to))

  return (
    <Link
      to={to}
      className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${active
          ? "bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]"
          : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
    >
      {label}
    </Link>
  )
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#050B1C]/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-6 md:px-12">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#1D6CE0] to-[#3EA6FF] shadow-[0_0_15px_rgba(29,108,224,0.4)] group-hover:scale-105 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <div className="text-2xl font-black tracking-tight font-sans">
            <span className="text-white">Ciné</span>
            <span className="text-[#1D6CE0]">Connect</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavItem to="/" label="Accueil" />
          <NavItem to="/films" label="Films" />
          <NavItem to="/discussion" label="Discussion" />
          <NavItem to="/profil" label="Profil" />
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/films"
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
            title="Rechercher"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </Link>

          <Link
            to="/login"
            className="flex items-center gap-2 rounded-full bg-[#1D6CE0] hover:bg-[#3EA6FF] px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 shadow-[0_0_15px_rgba(29,108,224,0.3)] hover:shadow-[0_0_20px_rgba(29,108,224,0.5)] transform hover:-translate-y-0.5"
          >
            Connexion
          </Link>
        </div>
      </div>
    </header>
  )
}