import { Link } from "@tanstack/react-router"

export function Footer() {
  return (
    <footer className="site-footer mt-16 border-t border-white/10 bg-[#050B1C]/98">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-10 md:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr] md:gap-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#007BFF] shadow-[0_0_14px_rgba(0,123,255,0.3)]">
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
              <span className="text-[1.35rem] font-bold tracking-tight sm:text-[1.5rem] md:text-[1.65rem]">
                <span className="text-white">Ciné</span>
                <span className="text-[#3EA6FF]">Connect</span>
              </span>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/75 sm:text-base sm:leading-8">
              La plateforme communautaire des cinéphiles passionnés. Découvrez des films, notez vos œuvres favorites et échangez autour du 7ᵉ art.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-bold tracking-tight text-white sm:text-xl">Plateforme</h4>
            <ul className="space-y-2.5 text-sm font-semibold text-white/85 sm:text-base">
              <li><Link to="/" className="transition hover:text-[#3EA6FF]">Accueil</Link></li>
              <li><Link to="/films" search={{ q: "", category: "", type: "all", sort: "" }} className="transition hover:text-[#3EA6FF]">Catalogue films</Link></li>
              <li><Link to="/discussion" className="transition hover:text-[#3EA6FF]">Discussions</Link></li>
              <li><Link to="/profil" className="transition hover:text-[#3EA6FF]">Mon profil</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-bold tracking-tight text-white sm:text-xl">Catégories</h4>
            <ul className="space-y-2.5 text-sm font-semibold text-white/85 sm:text-base">
              <li><Link to="/films" search={{ q: "", category: "Action", type: "all", sort: "" }} className="transition hover:text-[#3EA6FF]">Action & aventure</Link></li>
              <li><Link to="/films" search={{ q: "", category: "Drame", type: "all", sort: "" }} className="transition hover:text-[#3EA6FF]">Drame</Link></li>
              <li><Link to="/films" search={{ q: "", category: "Science-Fiction", type: "all", sort: "" }} className="transition hover:text-[#3EA6FF]">Science-fiction</Link></li>
              <li><Link to="/films" search={{ q: "", category: "Comédie", type: "all", sort: "" }} className="transition hover:text-[#3EA6FF]">Comédie</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-bold tracking-tight text-white sm:text-xl">Aide</h4>
            <ul className="space-y-2.5 text-sm font-semibold text-white/85 sm:text-base">
              <li><Link to="/utilisateurs" className="transition hover:text-[#3EA6FF]">Trouver des utilisateurs</Link></li>
              <li><Link to="/discussion" className="transition hover:text-[#3EA6FF]">Support</Link></li>
              <li><Link to="/profil" className="transition hover:text-[#3EA6FF]">Compte</Link></li>
              <li><a href="mailto:contact@cineconnect.app" className="transition hover:text-[#3EA6FF]">Nous écrire</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
