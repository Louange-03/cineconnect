import React from "react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { ReviewForm } from "../components/reviews/ReviewForm"
import { ReviewCard } from "../components/reviews/ReviewCard"
import { useReviews } from "../hooks/useReviews"
import { Reveal } from "../components/ui/Reveal"
import { useFilmDetailPage } from "../hooks/useFilmDetailPage"

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
  const {
    toast,
    resolvedFilmId,
    isFavorite,
    favoriteBusy,
    currentUserId,
    filmQuery,
    poster,
    yearLabel,
    onShare,
    onWatchlist,
    deleteMyReview,
    editMyReview,
  } = useFilmDetailPage(id)
  const { data: film, isLoading, error } = filmQuery

  const { data: reviews, isLoading: loadingReviews } = useReviews(resolvedFilmId)

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
        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-8 sm:px-6 md:px-12">
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
          <Reveal>
            <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A132D]/65 shadow-2xl backdrop-blur-xl md:rounded-[2rem]">
              <div className="grid gap-0 md:grid-cols-[320px_1fr] lg:grid-cols-[380px_1fr]">
              {/* Poster */}
              <div className="p-4 md:p-6">
                <div className="aspect-[2/3] overflow-hidden rounded-2xl bg-black/20 shadow-[0_10px_30px_rgba(0,0,0,0.75)]">
                  <img src={poster} alt={film.title} className="h-full w-full object-cover" loading="lazy" />
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center p-5 sm:p-6 md:p-10 md:pl-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                  {yearLabel && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold backdrop-blur-md">
                      {yearLabel}
                    </span>
                  )}

                  {film.categories?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {film.categories.slice(0, 4).map((c: string) => (
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

                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-6xl">
                  {film.title}
                </h1>

                <div className="mt-6 max-w-2xl rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-md">
                  <h2 className="mb-2 text-base font-bold text-white">Synopsis</h2>
                  <p className="text-base md:text-lg font-light leading-relaxed text-white/70">
                    {film.synopsis || "Aucun synopsis disponible pour ce film."}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={onWatchlist}
                    disabled={favoriteBusy}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] px-5 py-3 text-sm font-bold text-white transition transform hover:-translate-y-1 hover:brightness-110 shadow-[0_0_20px_rgba(29,108,224,0.35)] disabled:opacity-60 disabled:cursor-not-allowed sm:px-8 sm:py-4 sm:text-base"
                  >
                    {isFavorite ? "Retirer de ma liste" : "Ajouter à ma liste"}
                  </button>

                  <button
                    type="button"
                    onClick={onShare}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/90 hover:bg-white/10 sm:px-8 sm:py-4 sm:text-base"
                  >
                    Partager
                  </button>
                </div>
              </div>
            </div>
            </section>
          </Reveal>

          {/* REVIEWS */}
          <div className="mt-14 grid gap-10 pb-24 lg:grid-cols-[1fr_400px]">
            <Reveal as="section">
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-2xl md:text-3xl font-semibold text-white">Avis</h2>

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

              <p className="mb-5 text-sm text-white/60">
                Retrouvez ici les avis laisses par les autres personnes de la communaute.
              </p>

              <div className="space-y-6">
                {reviews && reviews.length > 0 ? (
                  reviews.map((r) => (
                    <ReviewCard
                      key={r.id}
                      review={r}
                      isMine={Boolean(currentUserId && r.userId === currentUserId)}
                      onEdit={
                        currentUserId && r.userId === currentUserId
                          ? () => editMyReview(r)
                          : undefined
                      }
                      onDelete={
                        currentUserId && r.userId === currentUserId
                          ? () => deleteMyReview(r.id)
                          : undefined
                      }
                    />
                  ))
                ) : (
                  <div className="rounded-3xl border border-white/10 border-dashed bg-white/5 p-12 text-center">
                    <span className="mb-4 block text-5xl opacity-50">⭐</span>
                    <p className="text-lg text-white/60">
                      Soyez le premier à partager votre avis sur ce film !
                    </p>
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal as="aside" className="h-fit rounded-3xl border border-white/10 bg-[#0A132D]/70 p-6 shadow-xl backdrop-blur-xl lg:sticky lg:top-24 lg:p-8">
              <h3 className="mb-2 text-2xl font-semibold text-white">Donnez votre avis</h3>
              <p className="mb-8 text-white/60">Partagez votre critique avec la communauté CinéConnect.</p>
              <ReviewForm filmId={resolvedFilmId} />
            </Reveal>
          </div>
        </div>
      </div>
    </main>
  )
}

export default FilmDetail