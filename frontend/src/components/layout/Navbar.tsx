import React from "react"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050B1C]/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Brand */}
        <a href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 border border-white/10">
            <span className="text-white/90 text-sm">🎬</span>
          </div>
          <div className="text-xl font-semibold tracking-tight">
            <span className="text-white">Ciné</span>
            <span className="text-[#1D6CE0]">Connect</span>
          </div>
        </a>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-white/75">
          <a className="hover:text-white transition" href="/">Accueil</a>
          <a className="hover:text-white transition" href="/films">Films</a>
          <a className="hover:text-white transition" href="/discussion">Discussion</a>
          <a className="hover:text-white transition" href="/profil">Profil</a>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
            title="Rechercher"
          >
            🔍
          </button>

          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] px-4 py-2 font-semibold text-white hover:brightness-110 transition"
          >
            Connexion <span className="opacity-90">→</span>
          </a>
        </div>
      </div>
    </header>
  )
}