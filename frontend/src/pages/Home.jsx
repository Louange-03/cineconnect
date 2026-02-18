import { Link } from "@tanstack/react-router"

const features = [
  {
    title: "Recherche instantanée",
    desc: "Trouve n’importe quel film via l’API OMDb, en quelques secondes.",
  },
  {
    title: "Notes & reviews",
    desc: "Note, commente et construis ta bibliothèque de critiques.",
  },
  {
    title: "Amis",
    desc: "Ajoute des amis, découvre leurs goûts et compare vos avis.",
  },
  {
    title: "Chat en temps réel",
    desc: "Discute comme sur Discord/Messenger, directement dans l’app.",
  },
]

export function Home() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="surface overflow-hidden">
        <div className="grid gap-10 p-8 md:grid-cols-2 md:items-center md:p-12">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-solid)] px-3 py-1 text-xs font-semibold text-[color:var(--muted)]">
              Réseau social cinéma • SaaS style
            </p>

            <h1 className="h-display mt-4 text-4xl font-semibold leading-tight md:text-5xl">
              Découvre, note et partage tes films préférés
            </h1>

            <p className="mt-4 max-w-prose text-base text-[color:var(--muted)]">
              CinéConnect combine l’expérience Netflix/Letterboxd avec une couche
              sociale moderne (amis, reviews, chat) — pensé pour être clair,
              rapide et agréable sur mobile comme sur desktop.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/films" className="btn btn-primary">
                Commencer
              </Link>
              <Link to="/register" className="btn btn-ghost">
                Créer un compte
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm text-[color:var(--muted)]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[color:var(--primary)]" />
                OMDb Search
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[color:var(--primary)]" />
                Reviews
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[color:var(--primary)]" />
                Chat
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-[28px] bg-gradient-to-br from-[color:var(--primary)]/25 via-transparent to-purple-500/15 blur-2xl" />
            <div className="relative grid gap-4">
              <div className="surface p-4">
                <p className="text-xs font-semibold text-[color:var(--muted)]">
                  Trending
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[2/3] rounded-xl border border-[color:var(--border)] bg-gradient-to-br from-black/10 to-black/0"
                    />
                  ))}
                </div>
              </div>

              <div className="surface p-4">
                <p className="text-xs font-semibold text-[color:var(--muted)]">
                  Dernières reviews
                </p>
                <div className="mt-3 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-solid)] px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-[color:var(--cinema)]" />
                        <div>
                          <p className="text-sm font-semibold">Film #{i + 1}</p>
                          <p className="text-xs text-[color:var(--muted)]">
                            “Super expérience”
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">★ 4</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="mb-6">
          <h2 className="h-display text-2xl font-semibold">
            Tout ce qu’il faut pour une expérience cinéma sociale
          </h2>
          <p className="mt-2 text-[color:var(--muted)]">
            Une UX claire, des composants propres, et un style startup SaaS.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="surface p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--cinema)] text-white">
                ✦
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-[color:var(--muted)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="pb-10 text-sm text-[color:var(--muted)]">
        <div className="surface flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} CinéConnect — Projet de formation
            développeur.
          </p>
          <div className="flex flex-wrap gap-3">
            <a className="underline" href="/films">
              Films
            </a>
            <a className="underline" href="/login">
              Connexion
            </a>
            <a className="underline" href="/register">
              Inscription
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
