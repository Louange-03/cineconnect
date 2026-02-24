import React from "react"

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#050B1C]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 border border-white/10">
                <span className="text-white/90 text-sm">🎬</span>
              </div>
              <div className="text-xl font-semibold tracking-tight">
                <span className="text-white">Ciné</span>
                <span className="text-[#1D6CE0]">Connect</span>
              </div>
            </div>
            <p className="mt-4 text-white/65 leading-relaxed">
              La plateforme communautaire des cinéphiles passionnés. Découvrez,
              notez et échangez autour du 7ème art.
            </p>

            <div className="mt-6 flex gap-3">
              <a className="h-10 w-10 grid place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10" href="#">🐦</a>
              <a className="h-10 w-10 grid place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10" href="#">📷</a>
              <a className="h-10 w-10 grid place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10" href="#">💬</a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold">Navigation</h4>
            <ul className="mt-4 space-y-2 text-white/65">
              <li><a className="hover:text-white" href="/">Accueil</a></li>
              <li><a className="hover:text-white" href="/films">Films</a></li>
              <li><a className="hover:text-white" href="/discussion">Discussion</a></li>
              <li><a className="hover:text-white" href="/profil">Profil</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold">Genres</h4>
            <ul className="mt-4 space-y-2 text-white/65">
              <li>Action</li>
              <li>Drame</li>
              <li>Science-Fiction</li>
              <li>Comédie</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} CinéConnect — Projet HETIC Web2
          </p>
          <p className="text-white/50 text-sm">
            Fait avec <span className="text-white/70">♥</span> pour les cinéphiles
          </p>
        </div>
      </div>
    </footer>
  )
}