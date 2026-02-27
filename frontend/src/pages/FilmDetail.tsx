import React, { useMemo } from "react"
import { Link, useParams } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { Film } from "../types"
import { ReviewForm } from "../components/reviews/ReviewForm"
import { ReviewCard } from "../components/reviews/ReviewCard"
import { useReviews } from "../hooks/useReviews"

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  })

  const contentType = res.headers.get("content-type") || ""
  const text = await res.text()

  if (!res.ok) {
    // essaie de remonter un message utile si le backend renvoie un JSON d’erreur
    try {
      if (contentType.includes("application/json")) {
        const json = JSON.parse(text)
        throw new Error(json?.message || "Erreur serveur")
      }
    } catch {
      // ignore parse
    }
    throw new Error("Film introuvable")
  }

  if (!contentType.includes("application/json")) {
    throw new Error("Réponse invalide du serveur (pas du JSON)")
  }

  return JSON.parse(text) as T
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium text-[#FFC107] shadow-[0_0_10px_rgba(255,193,7,0.10)]">
      {children}
    </span>
  )
}

function Spinner({ label = "Chargement" }: { label?: string }) {
  return (
    <div
      className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#1D6CE0]"
      aria-label={label}
      role="status"
    />
  )
}

function ActionButton({
  variant = "primary",
  children,
  onClick,
}: {
  variant?: "primary" | "ghost"
  children: React.ReactNode
  onClick?: () => void
}) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-8 py-4 font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C]"
  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] text-white shadow-[0_0_20px_rgba(29,108,224,0.35)] hover:brightness-110 hover:-translate-y-1"
      : "border border-white/10 bg-white/5 text-white hover:bg-white/10"

  return (
    <button type="button" className={`${base} ${styles}`} onClick={onClick}>
      {children}
    </button>
  )
}

export function FilmDetail() {
  const { id } = useParams({ from: "/films/$id" })

  const { data: film, isLoading, error } = useQuery<Film | null, Error>({
    queryKey: ["film", id],
    queryFn: async () => {
      const data = await fetchJson<{ film?: Film | null }>(`/api/films/${id}`)
      return data.film ?? null
    },
    enabled: !!id,
  })

  const { data: reviews, isLoading: loadingReviews } = useReviews(id)

  const poster = useMemo(() => {
    return (
      film?.posterUrl ||
      "https://via.placeholder.com/900x1350/0b1020/ffffff?text=No+Image"
    )
  }, [film?.posterUrl])

  if (isLoading) {
    return (
      <main className="flex min-h-[85vh] items-center justify-center bg-[#050B1C] pt-12">
        <Spinner />
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto min-h-[85vh] w-full bg-[#050B1C] px-4 pt-24 text-center">
        <div className="inline-block rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-red-200 motion-safe:animate-fade-in">
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
        <div className="inline-block rounded-2xl border border-white/10 bg-white/5 p-8 text-white/70 motion-safe:animate-fade-in">
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
      } else {
        await navigator.clipboard.writeText(url)
        alert("Lien copié ✅")
      }
    } catch {
      // ignore cancel
    }
  }

  return (
    <main className="relative min-h-[85vh] w-full overflow-hidden bg-[#050B1C] px-4 pb-20 pt-10">
      {/* Background ambiance */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-0 h-[55vh] w-full opacity-20 blur-[110px]"
        style={{
          backgroundImage: `url(${poster})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-0 h-[55vh] w-full bg-gradient-to-b from-transparent to-[#050B1C]"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Back */}
        <div className="mb-8">
          <Link
            to="/films"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Retour au catalogue
          </Link>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1128]/80 shadow-2xl backdrop-blur-xl motion-safe:animate-fade-in">
          <div className="grid gap-0 md:grid-cols-[360px_1fr]">
            {/* Poster */}
            <div className="relative h-full">
              <div className="aspect-[2/3] overflow-hidden p-4 pb-0 md:aspect-auto md:h-full md:p-6 md:pb-6">
                <img
                  src={poster}
                  alt={film.title}
                  className="h-full w-full rounded-2xl object-cover shadow-[0_10px_30px_rgba(0,0,0,0.75)]"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Content */}
            <div className="relative flex flex-col justify-center p-6 md:p-10 md:pl-6">
              <h1 className="mb-4 text-4xl font-black tracking-tight text-white md:text-6xl">
                {film.title}
              </h1>

              <div className="mb-6 flex flex-wrap items-center gap-4 font-medium text-gray-300">
                {film.year && (
                  <span className="flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-5 w-5 text-[#1D6CE0]"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                      />
                    </svg>
                    {film.year}
                  </span>
                )}

                {film.createdAt && (
                  <span className="border-l border-white/20 pl-4 text-sm">
                    Ajouté récemment au catalogue
                  </span>
                )}
              </div>

              {film.categories?.length ? (
                <div className="mb-8 flex flex-wrap gap-2">
                  {film.categories.map((c) => (
                    <Chip key={c}>{c}</Chip>
                  ))}
                </div>
              ) : null}

              {/* Actions */}
              <div className="mb-10 flex flex-wrap gap-4">
                <ActionButton
                  variant="primary"
                  onClick={() => alert("À brancher : favorites/watchlist ✅")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Ajouter à ma liste
                </ActionButton>

                <ActionButton variant="ghost" onClick={onShare}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                    />
                  </svg>
                  Partager
                </ActionButton>
              </div>

              {/* Synopsis */}
              <div>
                <h2 className="mb-3 text-xl font-bold text-white">Synopsis</h2>
                <p className="max-w-2xl text-lg font-light leading-relaxed text-gray-400">
                  {film.synopsis || "Aucun synopsis disponible pour ce film."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_380px]">
          {/* List */}
          <section className="motion-safe:animate-fade-in">
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-3xl font-bold text-white">Suggestions et Avis</h2>

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
              {reviews?.length ? (
                reviews.map((r) => <ReviewCard key={r.id} review={r} />)
              ) : (
                <div className="rounded-3xl border border-white/10 border-dashed bg-white/5 p-12 text-center">
                  <span className="mb-4 block text-5xl opacity-50" aria-hidden="true">
                    ⭐
                  </span>
                  <p className="text-lg text-gray-400">
                    Soyez le premier à partager votre avis sur ce film !
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Form */}
          <aside className="sticky top-28 h-fit rounded-3xl border border-white/10 bg-[#0a1128]/80 p-8 shadow-xl backdrop-blur-xl motion-safe:animate-fade-in">
            <h3 className="mb-2 text-2xl font-bold text-white">Donnez votre avis</h3>
            <p className="mb-8 text-gray-400">
              Partagez votre critique avec la communauté CinéConnect.
            </p>

            <div className="mt-6">
              <ReviewForm filmId={id} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}