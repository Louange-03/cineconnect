import React from "react"
import { Link } from "@tanstack/react-router"

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#050B1C] relative overflow-hidden">
      {/* Subtle glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-px bg-gradient-to-r from-transparent via-[#1D6CE0]/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 md:px-12 py-16">
        <div className="grid gap-12 md:grid-cols-4 lg:grid-cols-5">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 group inline-flex mb-6">
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
            <p className="text-gray-400 leading-relaxed max-w-sm">
              La plateforme communautaire des cinéphiles passionnés. Découvrez des millions de films,
              notez vos œuvres favorites et échangez en direct autour du 7ème art.
            </p>

            <div className="mt-8 flex gap-4">
              <a className="h-10 w-10 grid place-items-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-[#1D6CE0] hover:border-transparent transition-all duration-300 transform hover:-translate-y-1" href="#" aria-label="Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a className="h-10 w-10 grid place-items-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-[#1D6CE0] hover:border-transparent transition-all duration-300 transform hover:-translate-y-1" href="#" aria-label="GitHub">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              </a>
              <a className="h-10 w-10 grid place-items-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-[#1D6CE0] hover:border-transparent transition-all duration-300 transform hover:-translate-y-1" href="#" aria-label="Discord">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" /></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Plateforme</h4>
            <ul className="space-y-3">
              <li><Link className="text-gray-400 hover:text-[#1D6CE0] transition-colors" to="/">Accueil</Link></li>
              <li><Link className="text-gray-400 hover:text-[#1D6CE0] transition-colors" to="/films">Catalogue Films</Link></li>
              <li><Link className="text-gray-400 hover:text-[#1D6CE0] transition-colors" to="/discussion">Discussions Live</Link></li>
              <li><Link className="text-gray-400 hover:text-[#1D6CE0] transition-colors" to="/profil">Mon Profil</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Top Catégories</h4>
            <ul className="space-y-3">
              <li><Link className="text-gray-400 hover:text-[#1D6CE0] transition-colors" to="/films?category=Action">Action & Aventure</Link></li>
              <li><Link className="text-gray-400 hover:text-[#1D6CE0] transition-colors" to="/films?category=Drame">Drame Émouvant</Link></li>
              <li><Link className="text-gray-400 hover:text-[#1D6CE0] transition-colors" to="/films?category=Science-Fiction">Science-Fiction</Link></li>
              <li><Link className="text-gray-400 hover:text-[#1D6CE0] transition-colors" to="/films?category=Comédie">Comédie</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Légal & Aide</h4>
            <ul className="space-y-3">
              <li><a className="text-gray-400 hover:text-[#1D6CE0] transition-colors" href="#">Conditions d'utilisation</a></li>
              <li><a className="text-gray-400 hover:text-[#1D6CE0] transition-colors" href="#">Politique de confidentialité</a></li>
              <li><a className="text-gray-400 hover:text-[#1D6CE0] transition-colors" href="#">Centre d'aide</a></li>
              <li><a className="text-gray-400 hover:text-[#1D6CE0] transition-colors" href="#">Contactez-nous</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} CinéConnect. Projet HETIC Web2.
          </p>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            Fait avec
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            pour les cinéphiles
          </div>
        </div>
      </div>
    </footer>
  )
}