import React, { useMemo } from "react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { Film } from "../types"
import { ReviewForm } from "../components/reviews/ReviewForm"
import { ReviewCard } from "../components/reviews/ReviewCard"
import { useReviews } from "../hooks/useReviews"

/** small JSON fetch wrapper that throws useful errors */
async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
  })

  const contentType = res.headers.get("content-type") || ""
  const text = await res.text()

  if (!res.ok) {
    try {
      if (contentType.includes("application/json")) {
        const json = JSON.parse(text)
        throw new Error(json?.message || "Erreur serveur")
      }
    } catch {
      // ignore parsing error
    }
    throw new Error("Film introuvable")
  }

  if (!contentType.includes("application/json")) {
    throw new Error("Réponse invalide du serveur (pas du JSON)")
  }

  return JSON.parse(text) as T
}

const FALLBACK_POSTER = "https://via.placeholder.com/900x1350/0b1020/ffffff?text=No+Image"

function safePosterUrl(posterUrl?: string | null) {
  const p = (posterUrl ?? "").trim()
  if (!p) return FALLBACK_POSTER
  if (p.toLowerCase() === "n/a") return FALLBACK_POSTER
  return p
}

function MiniToast({ message }: { message: string }) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-6 z-50 -translate-x-1/2">
      <div className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-md shadow-lg">
        {message}
      </div>
    </div>
  )
}

export function FilmDetail() {
  const { id } = useParams({ from: "/film/$id" })
  const navigate = useNavigate()

  const [toast, setToast] = React.useState<string | null>(null)
  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 1600)
  }

  const { data: film, isLoading, error } = useQuery<Film | null, Error>({
    queryKey: ["film", id],
    queryFn: async () => {
      const data = await fetchJson<{ film?: Film | null }>(`/api/films/${id}`)
      return data.film ?? null
    },
    enabled: !!id,
  })

  const { data: reviews, isLoading: loadingReviews } = useReviews(id)

  const poster = useMemo(() => safePosterUrl(film?.posterUrl), [film?.posterUrl])

  const yearLabel =
    film?.year === null || film?.year === undefined || String(film?.year ?? "").trim() === ""
      ? null
      : String(film?.year)

  if (isLoading) {
    return (
      <main className="flex min-h-[85vh] items-center justify-center bg-[#050B1C] pt-12">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#1D6CE0]"
          role="status"
          aria-label="Chargement"
        />
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto min-h-[85vh] w-full bg-[#050B1C] px-4 pt-24 text-center">
        <div className="inline-block rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-red-200">
          <span className="mb-4 block text-4xl" aria-hidden="true">
            ⚠️
          </span>
          {error.message}
        </div>
      </main>
    )
  }

  if (!film) {
    return (
      <main className="mx-auto min-h-[85vh] w-full bg-[#050B1C] px-4 pt-24 text-center">
        <div className="inline-block rounded-2xl border border-white/10 bg-white/5 p-8 text-white/70">
          <span className="mb-4 block text-4xl" aria-hidden="true">
            🎬
          </span>
          Ce film n&apos;existe pas ou a été retiré.
        </div>
      </main>
    )
  }

  const onShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: film.title, url })
        showToast("Partagé ✅")
      } else {
        await navigator.clipboard.writeText(url)
        showToast("Lien copié ✅")
      }
    } catch {
      // ignore cancel/errors
    }
  }

  const onWatchlist = () => {
    // À brancher plus tard sur ton endpoint (watchlist/favorites)
    showToast("Ajout à ma liste : à connecter ✅")
  }

  return (
    <main className="relative min-h-[85vh] w-full overflow-hidden bg-[#050B1C] pb-24">
      {toast && <MiniToast message={toast} />}

      {/* HERO BACKDROP */}
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute inset-0 h-[62vh] w-full"
          style={{
            backgroundImage: `url(${poster})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div aria-hidden="true" className="absolute inset-0 h-[62vh] w-full bg-black/40" />
        <div
          aria-hidden="true"
          className="absolute inset-0 h-[62vh] w-full bg-gradient-to-b from-[#050B1C]/10 via-[#050B1C]/55 to-[#050B1C]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-[62vh] w-full opacity-25 blur-[120px]"
          style={{
            backgroundImage: `url(${poster})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* CONTENT WRAPPER */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-10 md:px-12">
          {/* Back */}
          <div className="mb-6">
            <button
              onClick={() =>
                navigate({
                  to: "/films",
                  search: { q: "", category: "", type: "all", sort: "" },
                })
              }
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Retour au catalogue"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Retour
            </button>
          </div>

          {/* MAIN CARD */}
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0A132D]/65 shadow-2xl backdrop-blur-xl">
            <div className="grid gap-0 md:grid-cols-[380px_1fr]">
              {/* Poster */}
              <div className="p-4 md:p-6">
                <div className="aspect-[2/3] overflow-hidden rounded-2xl bg-black/20 shadow-[0_10px_30px_rgba(0,0,0,0.75)]">
                  <img src={poster} alt={film.title} className="h-full w-full object-cover" loading="lazy" />
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center p-6 md:p-10 md:pl-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                  {yearLabel && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold backdrop-blur-md">
                      {yearLabel}
                    </span>
                  )}

                  {film.categories?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {film.categories.slice(0, 4).map((c) => (
                        <span
                          key={c}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] font-medium uppercase tracking-wider text-[#FFC107]/90"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
                  {film.title}
                </h1>

                <div className="mt-6 max-w-2xl rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-md">
                  <h2 className="mb-2 text-base font-bold text-white">Synopsis</h2>
                  <p className="text-base md:text-lg font-light leading-relaxed text-white/70">
                    {film.synopsis || "Aucun synopsis disponible pour ce film."}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={onWatchlist}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] px-8 py-4 font-bold text-white transition transform hover:-translate-y-1 hover:brightness-110 shadow-[0_0_20px_rgba(29,108,224,0.35)]"
                  >
                    Ajouter à ma liste
                  </button>

                  <button
                    type="button"
                    onClick={onShare}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 font-bold text-white/90 hover:bg-white/10"
                  >
                    Partager
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* REVIEWS */}
          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_400px] pb-24">
            <section>
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-2xl md:text-3xl font-black text-white">Avis</h2>

                {loadingReviews ? (
                  <div
                    className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-[#FFC107]"
                    aria-label="Chargement des avis"
                    role="status"
                  />
                ) : (
                  <span className="rounded-full border border-[#FFC107]/20 bg-[#FFC107]/10 px-3 py-1 text-sm font-bold text-[#FFC107]">
                    {reviews?.length || 0} avis
                  </span>
                )}
              </div>

              <div className="space-y-6">
                {reviews && reviews.length > 0 ? (
                  reviews.map((r) => <ReviewCard key={r.id} review={r} />)
                ) : (
                  <div className="rounded-3xl border border-white/10 border-dashed bg-white/5 p-12 text-center">
                    <span className="mb-4 block text-5xl opacity-50">⭐</span>
                    <p className="text-lg text-white/60">
                      Soyez le premier à partager votre avis sur ce film !
                    </p>
                  </div>
                )}
              </div>
            </section>

            <aside className="sticky top-24 h-fit rounded-3xl border border-white/10 bg-[#0A132D]/70 p-8 shadow-xl backdrop-blur-xl">
              <h3 className="mb-2 text-2xl font-black text-white">Donnez votre avis</h3>
              <p className="mb-8 text-white/60">Partagez votre critique avec la communauté CinéConnect.</p>
              <ReviewForm filmId={id} />
            </aside>
          </div>
        </div>
      </div>
    </main>
  )
}

export default FilmDetail