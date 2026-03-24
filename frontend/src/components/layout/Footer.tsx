import { Link } from "@tanstack/react-router"

export function Footer() {
  return (
    <footer className="site-footer mt-16 border-t border-white/10 bg-[#050B1C]">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#1D6CE0] to-[#3EA6FF] shadow-[0_0_16px_rgba(29,108,224,0.35)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="white"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </div>
              <span className="text-[1.65rem] font-black tracking-tight">
                <span className="text-white">Ciné</span>
                <span className="text-[#3EA6FF]">Connect</span>
              </span>
            </Link>

            <p className="mt-6 max-w-md text-[1.05rem] leading-8 text-white/75">
              La plateforme communautaire des cinéphiles passionnés. Découvrez des films, notez vos œuvres favorites et échangez en direct autour du 7ème art.
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-2xl font-black tracking-tight text-white">Plateforme</h4>
            <ul className="space-y-3 text-lg font-semibold text-white/85">
              <li><Link to="/" className="transition hover:text-white">Accueil</Link></li>
              <li><Link to="/films" search={{ q: "", category: "", type: "movie", sort: "" }} className="transition hover:text-white">Catalogue Films</Link></li>
              <li><Link to="/discussion" className="transition hover:text-white">Discussions Live</Link></li>
              <li><Link to="/amis" className="transition hover:text-white">Mes Amis</Link></li>
              <li><Link to="/profil" className="transition hover:text-white">Mon Profil</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-2xl font-black tracking-tight text-white">Top categories</h4>
            <ul className="space-y-3 text-lg font-semibold text-white/85">
              <li><Link to="/films" search={{ q: "", category: "Action", type: "movie", sort: "" }} className="transition hover:text-white">Action & Aventure</Link></li>
              <li><Link to="/films" search={{ q: "", category: "Drame", type: "movie", sort: "" }} className="transition hover:text-white">Drame émouvant</Link></li>
              <li><Link to="/films" search={{ q: "", category: "Science-Fiction", type: "movie", sort: "" }} className="transition hover:text-white">Science-Fiction</Link></li>
              <li><Link to="/films" search={{ q: "", category: "Comédie", type: "movie", sort: "" }} className="transition hover:text-white">Comédie</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-2xl font-black tracking-tight text-white">Légal & aide</h4>
            <ul className="space-y-3 text-lg font-semibold text-white/85">
              <li><Link to="/utilisateurs" className="transition hover:text-white">Trouver des utilisateurs</Link></li>
              <li><Link to="/discussion" className="transition hover:text-white">Support discussion</Link></li>
              <li><Link to="/profil" className="transition hover:text-white">Compte & profil</Link></li>
              <li><a href="mailto:contact@cineconnect.app" className="transition hover:text-white">Contactez-nous</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}