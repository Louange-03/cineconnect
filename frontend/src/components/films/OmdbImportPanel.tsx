import React, { useState } from "react"
import { useOmdbSearch, useImportOmdbFilm } from "../../hooks/useOmdb"

export function OmdbImportPanel() {
  const [q, setQ] = useState("")
  const { data, isLoading } = useOmdbSearch(q)
  const importMut = useImportOmdbFilm()

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold">Importer depuis OMDb</h3>
      <p className="mt-1 text-sm text-white/60">
        Tape au moins 3 caractères, puis ajoute le film au catalogue local.
      </p>

      <div className="mt-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ex: Inception, Interstellar..."
          className="h-[48px] w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-white placeholder:text-white/40 outline-none focus:border-[#1D6CE0]/70"
        />
      </div>

      {isLoading && <p className="mt-4 text-white/60">Recherche…</p>}

      <div className="mt-5 grid gap-3">
        {(data ?? []).slice(0, 8).map((m) => (
          <div
            key={m.imdbID}
            className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={
                  m.Poster && m.Poster !== "N/A"
                    ? m.Poster
                    : "https://via.placeholder.com/80x120/0b1020/ffffff?text=No+Image"
                }
                alt={m.Title}
                className="h-16 w-12 rounded-lg object-cover"
                loading="lazy"
              />
              <div>
                <p className="font-semibold">{m.Title}</p>
                <p className="text-sm text-white/60">{m.Year}</p>
              </div>
            </div>

            <button
              type="button"
              disabled={importMut.isPending}
              onClick={() => importMut.mutate(m.imdbID)}
              className="rounded-2xl bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] px-4 py-2 font-semibold hover:brightness-110 transition disabled:opacity-60"
            >
              Ajouter
            </button>
          </div>
        ))}

        {q.trim().length >= 3 && !isLoading && (data ?? []).length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/65">
            Aucun résultat OMDb.
          </div>
        )}

        {importMut.error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {String((importMut.error as any)?.message || importMut.error)}
          </div>
        )}

        {importMut.isSuccess && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100">
            Film importé ✅ (le catalogue s’est rafraîchi)
          </div>
        )}
      </div>
    </div>
  )
}