import React, { useMemo, useState } from "react"
import { Link, useRouterState } from "@tanstack/react-router"

type NavLinkItem = { to: string; label: string }

function usePathname() {
  return useRouterState({ select: (s) => s.location.pathname })
}

function NavItem({ to, label }: NavLinkItem) {
  const pathname = usePathname()
  const active = pathname === to || (to !== "/" && pathname.startsWith(to))

  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={[
        "relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C]",
        active
          ? "bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.10)]"
          : "text-gray-400 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      {label}
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute left-1/2 top-[calc(100%+2px)] h-[2px] w-0 -translate-x-1/2 rounded-full bg-[#3EA6FF] transition-all duration-300",
          active ? "w-6 opacity-100" : "opacity-0 group-hover:w-6",
        ].join(" ")}
      />
    </Link>
  )
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const nav = useMemo<NavLinkItem[]>(
    () => [
      { to: "/", label: "Accueil" },
      { to: "/films", label: "Films" },
      { to: "/discussion", label: "Discussion" },
      { to: "/profil", label: "Profil" },
    ],
    [],
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050B1C]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-12">
        {/* Brand */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#1D6CE0] to-[#3EA6FF] shadow-[0_0_15px_rgba(29,108,224,0.35)] transition-transform duration-300 group-hover:scale-105">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="white"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>

          <div className="text-2xl font-black tracking-tight">
            <span className="text-white">Ciné</span>
            <span className="text-[#1D6CE0]">Connect</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/films"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300/70 transition-colors hover:bg-white/10 hover:text-white sm:flex"
            title="Rechercher"
            aria-label="Aller au catalogue"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </Link>

          <Link
            to="/login"
            className="rounded-full bg-[#1D6CE0] px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(29,108,224,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3EA6FF] hover:shadow-[0_0_22px_rgba(29,108,224,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3EA6FF]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C]"
          >
            Connexion
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 md:hidden"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden">
          <div className="mx-auto max-w-7xl px-6 pb-5 md:px-12">
            <div className="mt-3 rounded-2xl border border-white/10 bg-[#0A132D]/60 p-3 backdrop-blur-xl motion-safe:animate-fade-in">
              <div className="flex flex-col gap-2">
                {nav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}