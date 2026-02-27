import React, { useEffect, useMemo, useState } from "react"
import { useOmdbSearch, useImportOmdbFilm } from "../../hooks/useOmdb"

export function OmdbImportPanel({ initialQuery }: { initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery || "")
  const [debouncedQ, setDebouncedQ] = useState(initialQuery || "")
  const importMut = useImportOmdbFilm()

  useEffect(() => {
    if (initialQuery) {
      setQ(initialQuery)
      setDebouncedQ(initialQuery)
    }
  }, [initialQuery])

  // Debounce input before calling OMDb search
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q), 350)
    return () => window.clearTimeout(t)
  }, [q])

  const canSearch = useMemo(() => debouncedQ.trim().length >= 3, [debouncedQ])
  const { data, isLoading } = useOmdbSearch(canSearch ? debouncedQ : "")

  const list = useMemo(() => (data ?? []).slice(0, 8), [data])

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 border-b border-white/10 bg-[#0A132D]/40 px-6 py-5 backdrop-blur-xl">
        <div>
          <h3 className="text-lg font-semibold text-white">Import OMDb</h3>
          <p className="mt-1 text-sm text-white/60">
            Aucun film local trouvé. Importez rapidement depuis OMDb.
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-[#FFC107]">
          Beta
        </span>
      </div>

      {/* Search input */}
      <div className="px-6 py-5">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ex: Inception, Interstellar..."
            className="h-[52px] w-full rounded-2xl border border-white/15 bg-white/5 pl-12 pr-4 text-white placeholder:text-white/40 outline-none transition focus:border-[#3EA6FF]/70 focus:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#3EA6FF]/30"
          />
        </div>

        <div className="mt-3 text-xs text-white/50">
          Tapez au moins <span className="font-semibold text-white/70">3 caractères</span> pour lancer la recherche.
        </div>
      </div>

      {/* Body */}
      <div className="px-6 pb-6">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-12 rounded-lg bg-white/10 motion-safe:animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-44 rounded bg-white/10 motion-safe:animate-pulse" />
                    <div className="h-3 w-20 rounded bg-white/10 motion-safe:animate-pulse" />
                  </div>
                </div>
                <div className="h-9 w-24 rounded-xl bg-white/10 motion-safe:animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!isLoading && list.length > 0 && (
          <div className="grid gap-3">
            {list.map((m) => {
              const poster =
                m.Poster && m.Poster !== "N/A"
                  ? m.Poster
                  : "https://via.placeholder.com/80x120/0b1020/ffffff?text=No+Image"

              return (
                <div
                  key={m.imdbID}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <img
                      src={poster}
                      alt={m.Title}
                      className="h-16 w-12 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{m.Title}</p>
                      <p className="text-sm text-white/60">{m.Year}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={importMut.isPending}
                    onClick={() => importMut.mutate(m.imdbID)}
                    className="rounded-xl bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] px-4 py-2 font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                  >
                    {importMut.isPending ? "Ajout…" : "Ajouter"}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty states */}
        {canSearch && !isLoading && (data ?? []).length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/65">
            Aucun résultat OMDb.
          </div>
        )}

        {!canSearch && q.trim().length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
            Continuez à taper… (minimum 3 caractères)
          </div>
        )}

        {/* Feedback */}
        {importMut.error && (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {String((importMut.error as any)?.message || importMut.error)}
          </div>
        )}

        {importMut.isSuccess && (
          <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100">
            Film importé ✅ (le catalogue s’est rafraîchi)
          </div>
        )}
      </div>
    </section>
  )
}