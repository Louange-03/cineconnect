import React, { useMemo } from "react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { Film } from "../types"
import { ReviewForm } from "../components/reviews/ReviewForm"
import { ReviewCard } from "../components/reviews/ReviewCard"
import { useReviews } from "../hooks/useReviews"
import { Reveal } from "../components/ui/Reveal"
import { getToken, getUser } from "../lib/auth"
import { buildApiUrl } from "../lib/apiUrl"
import type { Review } from "../types"
import { FALLBACK_POSTER, resolvePosterUrl } from "../lib/poster"

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
        throw new Error(json?.message ?? "Film introuvable")
      }
    } catch (e) {
      if (e instanceof Error) throw e
    }
    throw new Error("Film introuvable")
  }

  if (!contentType.includes("application/json")) {
    throw new Error("Réponse invalide du serveur (pas du JSON)")
  }

  return JSON.parse(text) as T
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
  const qc = useQueryClient()
  const { id } = useParams({ from: "/film/$id" })
  const navigate = useNavigate()

  const [toast, setToast] = React.useState<string | null>(null)
  const [resolvedFilmId, setResolvedFilmId] = React.useState(id)
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [favoriteBusy, setFavoriteBusy] = React.useState(false)
  const currentUserId = getUser()?.id ?? null
  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 1600)
  }

  const { data: film, isLoading, error } = useQuery<Film | null, Error>({
    queryKey: ["film", id],
    queryFn: async () => {
      const data = await fetchJson<{ film?: Film | null }>(buildApiUrl(`/api/films/${id}`))
      return data.film ?? null
    },
    enabled: !!id,
  })

  const { data: reviews, isLoading: loadingReviews } = useReviews(resolvedFilmId)

  const poster = useMemo(() => resolvePosterUrl(film), [film])

  const yearLabel =
    film?.year === null || film?.year === undefined || String(film?.year ?? "").trim() === ""
      ? null
      : String(film?.year)

  const onShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: film?.title ?? "Film", url })
        showToast("Partagé ✅")
      } else {
        await navigator.clipboard.writeText(url)
        showToast("Lien copié ✅")
      }
    } catch {
      // ignore cancel/errors
    }
  }

  const ensureFilmInDb = React.useCallback(
    async (token: string): Promise<string> => {
      if (!/^tt\d+$/i.test(resolvedFilmId)) return resolvedFilmId

      const imported = await fetch(buildApiUrl("/api/films/import"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imdbID: resolvedFilmId }),
      })

      const contentType = imported.headers.get("content-type") || ""
      const text = await imported.text()
      const json = contentType.includes("application/json") && text ? JSON.parse(text) : null
      if (!imported.ok) {
        throw new Error(json?.message || "Impossible d'importer le film")
      }

      const nextId = String(json?.film?.id || resolvedFilmId)
      setResolvedFilmId(nextId)
      return nextId
    },
    [resolvedFilmId]
  )

  const onWatchlist = () => {
    void (async () => {
      if (!resolvedFilmId || favoriteBusy) return
      const token = getToken()
      if (!token) {
        showToast("Connecte-toi pour gérer ta liste.")
        return
      }

      const next = !isFavorite
      setFavoriteBusy(true)
      try {
        const targetFilmId = await ensureFilmInDb(token)
        const res = await fetch(buildApiUrl(`/api/users/me/favorites/${targetFilmId}`), {
          method: next ? "POST" : "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        const contentType = res.headers.get("content-type") || ""
        const text = await res.text()
        const json = contentType.includes("application/json") && text ? JSON.parse(text) : null
        if (!res.ok) {
          throw new Error(json?.message || "Impossible de modifier la liste")
        }
        setIsFavorite(next)
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("favorites-changed"))
        }
        showToast(next ? "Ajouté à ma liste ✅" : "Retiré de ma liste ✅")
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erreur liste"
        showToast(msg)
      } finally {
        setFavoriteBusy(false)
      }
    })()
  }

  const deleteMyReview = (reviewId: string) => {
    void (async () => {
      const token = getToken()
      if (!token) {
        showToast("Connecte-toi pour gerer tes avis.")
        return
      }
      try {
        const res = await fetch(buildApiUrl(`/api/reviews/${reviewId}`), {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("Suppression impossible")
        await qc.invalidateQueries({ queryKey: ["reviews", resolvedFilmId] })
        showToast("Avis supprime ✅")
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erreur suppression avis"
        showToast(msg)
      }
    })()
  }

  const editMyReview = (review: Review) => {
    const nextRatingRaw = window.prompt(
      "Nouvelle note (1 a 5)",
      String(review.rating ?? 0)
    )
    if (nextRatingRaw === null) return
    const nextRating = Number(nextRatingRaw)
    if (!Number.isFinite(nextRating) || nextRating < 1 || nextRating > 5) {
      showToast("Note invalide (1 a 5).")
      return
    }
    const nextComment = window.prompt(
      "Modifier votre commentaire",
      review.comment ?? ""
    )
    if (nextComment === null) return

    void (async () => {
      const token = getToken()
      if (!token) {
        showToast("Connecte-toi pour modifier ton avis.")
        return
      }
      try {
        const res = await fetch(buildApiUrl(`/api/reviews/${review.id}`), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: Math.round(nextRating),
            comment: nextComment,
          }),
        })
        if (!res.ok) throw new Error("Modification impossible")
        await qc.invalidateQueries({ queryKey: ["reviews", resolvedFilmId] })
        showToast("Avis modifie ✅")
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erreur modification avis"
        showToast(msg)
      }
    })()
  }

  React.useEffect(() => {
    setResolvedFilmId(id)
  }, [id])

  React.useEffect(() => {
    if (!/^tt\d+$/i.test(resolvedFilmId)) return
    const token = getToken()
    if (!token) return
    void ensureFilmInDb(token).catch(() => {
      // Keep page usable even if import fails; actions will show explicit errors.
    })
  }, [resolvedFilmId, ensureFilmInDb])

  React.useEffect(() => {
    let cancelled = false

    async function syncFavoriteState() {
      if (!resolvedFilmId) return
      const token = getToken()
      if (!token) {
        if (!cancelled) setIsFavorite(false)
        return
      }
      try {
        const res = await fetch(buildApiUrl("/api/users/me/favorites"), {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        const list = Array.isArray(data?.favorites) ? data.favorites : []
        const found = list.some((f: { id?: string }) => f?.id === resolvedFilmId)
        if (!cancelled) setIsFavorite(found)
      } catch {
        if (!cancelled) setIsFavorite(false)
      }
    }

    void syncFavoriteState()
    const refresh = () => void syncFavoriteState()
    window.addEventListener("favorites-changed", refresh)
    window.addEventListener("focus", refresh)
    return () => {
      cancelled = true
      window.removeEventListener("favorites-changed", refresh)
      window.removeEventListener("focus", refresh)
    }
  }, [resolvedFilmId])

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
          <Reveal>
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

                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
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
                    disabled={favoriteBusy}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] px-8 py-4 font-bold text-white transition transform hover:-translate-y-1 hover:brightness-110 shadow-[0_0_20px_rgba(29,108,224,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isFavorite ? "Retirer de ma liste" : "Ajouter à ma liste"}
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
          </Reveal>

          {/* REVIEWS */}
          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_400px] pb-24">
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

            <Reveal as="aside" className="sticky top-24 h-fit rounded-3xl border border-white/10 bg-[#0A132D]/70 p-8 shadow-xl backdrop-blur-xl">
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