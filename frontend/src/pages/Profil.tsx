import React, { useState, useEffect } from "react"
import { Link } from "@tanstack/react-router"
import { useAuth } from "../hooks/useAuth"
import axios from "axios"

type FavoriteFilm = {
  id: number
  title: string
  year: string
  posterUrl: string | null
}

function FilmCard({ film }: { film: FavoriteFilm }) {
  const poster = film.posterUrl || "https://via.placeholder.com/300x450/0b1020/ffffff?text=No+Image"

  return (
    <div className="group block w-full">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <img src={poster} alt={film.title} className="h-full w-full object-cover" />
        <div className="absolute bottom-0 p-3">
          <p className="font-bold text-white">{film.title}</p>
          <span className="text-xs text-white/70">{film.year}</span>
        </div>
      </div>
    </div>
  )
}

export function Profil() {
  const { user } = useAuth()
  const [favoriteFilms, setFavoriteFilms] = useState<FavoriteFilm[]>([])
  const [avatar, setAvatar] = useState<string | null>(localStorage.getItem("user_avatar"))

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const res = await axios.get("http://localhost:3001/api/users/me/favorites", {
          headers: { Authorization: `Bearer ${token}` }
        })

        setFavoriteFilms(res.data.favorites)
      } catch {
        console.error("Erreur favoris")
      }
    }

    fetchFavs()
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setAvatar(result)
      localStorage.setItem("user_avatar", result)
    }
    reader.readAsDataURL(file)
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center py-20 text-slate-400">
        <p>Tu n'es pas connecté</p>
        <Link to="/login">Se connecter</Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#050B1C] text-white pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-20 space-y-10">

        {/* HEADER */}
        <div className="flex items-center justify-between bg-[#0A132D] p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-blue-500">
              {avatar ? (
                <img src={avatar} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl flex items-center justify-center h-full">
                  {user.username[0].toUpperCase()}
                </span>
              )}

              <input
                type="file"
                onChange={handleAvatarChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-blue-400">{user.email}</p>
            </div>
          </div>

          <Link
            to="/settings"
            className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20"
          >
            ⚙️ Paramètres
          </Link>
        </div>

        {/* FAVORIS */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Films favoris</h2>

          {favoriteFilms.length === 0 ? (
            <p className="text-white/50">Aucun favori</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {favoriteFilms.map((film) => (
                <FilmCard key={film.id} film={film} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}