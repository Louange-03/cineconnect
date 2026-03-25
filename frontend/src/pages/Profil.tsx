import React, { useState, useEffect } from "react"
import { Link } from "@tanstack/react-router"
import { useAuth } from "../hooks/useAuth"
import { useLocation } from "@tanstack/react-router"
import axios from "axios"
import { getToken, logout } from "../lib/auth"

type FavoriteFilm = {
  id: number
  title: string
  year: string
  posterUrl: string | null
}

type FilmCardProps = {
  film: FavoriteFilm
}

function FilmCard({ film }: FilmCardProps) {
  const poster = film.posterUrl || "https://via.placeholder.com/300x450/0b1020/ffffff?text=No+Image"
  return (
    <div className="group block w-full outline-none">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg transition-transform duration-300 will-change-transform group-hover:-translate-y-1 group-hover:scale-[1.03] group-hover:shadow-[0_12px_30px_rgba(29,108,224,0.20)]">
        <img
          src={poster}
          alt={film.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
          loading="lazy"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B1C]/90 via-[#050B1C]/25 to-transparent opacity-80" />

        {/* Bottom text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
          <p className="text-base font-bold text-white truncate drop-shadow-md">{film.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-md border border-white/10">
              {film.year || "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Profil() {
  const API_BASE =
    (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? ""
  const { user } = useAuth()
  const location = useLocation()
  const message = (location.state as any)?.message as string | undefined
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [favoriteFilms, setFavoriteFilms] = useState<FavoriteFilm[]>([])
  const [avatar, setAvatar] = useState<string | null>(localStorage.getItem("user_avatar"))
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleChangePassword = async () => {
    const currentPass = prompt("Entrez votre mot de passe actuel :")
    if (!currentPass) return
    const newPass = prompt("Entrez votre NOUVEAU mot de passe :")
    if (!newPass || newPass.length < 6) {
      showToast("Le mot de passe doit faire au moins 6 caractères.", "error")
      return
    }

    try {
      const token = getToken()
      await axios.put(`${API_BASE}/api/users/me/password`, { password: newPass }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast("Mot de passe modifié avec succès !", "success")
    } catch {
      showToast("La modification a échoué. Veuillez réessayer.", "error")
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm("C'est définitif. Êtes-vous ABSOLUMENT sûr de vouloir supprimer votre compte ?")) return
    try {
      const token = getToken()
      await axios.delete(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      logout()
      window.location.href = "/register"
    } catch {
      showToast("Opération impossible à cause des données liées.", "error")
    }
  }

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const token = getToken()
        if (!token) return
        const res = await axios.get(`${API_BASE}/api/users/me/favorites`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setFavoriteFilms(res.data.favorites)
      } catch (err) {
        console.error("Erreur lors de la recup des favoris")
      }
    }
    fetchFavs()
    const onFavoritesChanged = () => fetchFavs()
    window.addEventListener("favorites-changed", onFavoritesChanged)
    return () => window.removeEventListener("favorites-changed", onFavoritesChanged)
  }, [API_BASE])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatar(result)
        localStorage.setItem("user_avatar", result)
      }
      reader.readAsDataURL(file)
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
        <p className="text-lg">Tu n'es pas connecté.</p>
        <Link to="/login" className="text-blue-400 hover:underline text-sm">
          Se connecter
        </Link>
      </div>
    )
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    })
    : null

  return (
    <main className="min-h-screen bg-[#050B1C] text-white pb-20">
      {/* Banner Area */}
      <div className="h-64 md:h-80 w-full bg-gradient-to-br from-[#1D6CE0]/40 via-[#0A132D] to-[#050B1C] relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B1C] to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-32 relative z-10 space-y-8">
        {/* User Profile Header section */}
        <div className="rounded-3xl border border-white/10 bg-[#0A132D]/80 backdrop-blur-xl p-8 shadow-2xl flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="relative group h-32 w-32 shrink-0 rounded-full border-4 border-[#050B1C] bg-gradient-to-br from-[#1D6CE0] to-[#3EA6FF] flex items-center justify-center text-5xl font-semibold text-white shadow-xl overflow-hidden">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
              {/* Optional hover overlay just for cool effect */}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white/80">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="space-y-1 mb-2">
              <h1 className="text-4xl font-semibold tracking-tight text-white shadow-sm">
                {user.username}
              </h1>
              <p className="text-lg text-[#3EA6FF] font-medium">{user.email}</p>
              {memberSince && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                  </svg>
                  Membre depuis {memberSince}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="group flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10 hover:border-white/30 shrink-0 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:rotate-45 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Paramètres
          </button>
        </div>

        {message && (
          <div className="rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 p-4 font-medium flex items-center gap-3 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            {message}
          </div>
        )}

        {/* Favorite Films Section */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#FFC107]">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
            </svg>
            <h2 className="text-3xl font-bold tracking-tight text-white">Films favoris</h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10 shadow-xl backdrop-blur-sm min-h-[300px]">
            {favoriteFilms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-5 text-white/50 pt-8 pb-12">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-medium text-white/90">Aucun favori</p>
                  <p className="text-sm">Sauvegardez les films que vous aimez pour les retrouver ici.</p>
                </div>
                <Link
                  to="/films"
                  search={{ q: "", category: "", type: "movie", sort: "" }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1D6CE0] px-6 py-2.5 font-bold text-white shadow-lg transition-all hover:bg-[#3EA6FF] hover:-translate-y-0.5 mt-2"
                >
                  Explorer le catalogue
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {favoriteFilms.map((film) => (
                  <FilmCard key={film.id} film={film} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Settings Modal Overlay */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050B1C]/80 backdrop-blur-md p-4 motion-safe:animate-fade-in">
          <div className="w-full max-w-lg max-h-[90vh] rounded-3xl border border-white/10 bg-[#0A132D] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
              <h2 className="text-2xl font-bold text-white">Paramètres du profil</h2>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#3EA6FF]">Informations personnelles</h3>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#1D6CE0] to-[#3EA6FF] flex items-center justify-center text-2xl font-bold overflow-hidden shadow-inner">
                      {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : user?.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/90">Photo de profil</p>
                      <p className="text-xs text-white/50 mb-2">PNG, JPG jusqu'à 5MB</p>
                      <label className="text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full cursor-pointer transition-colors shadow-sm">
                        Changer l'image
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/60 block mb-1">Nom d'utilisateur</label>
                    <input type="text" disabled defaultValue={user?.username} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 cursor-not-allowed shadow-inner" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/60 block mb-1">Adresse Email</label>
                    <input type="email" disabled defaultValue={user?.email} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 cursor-not-allowed shadow-inner" />
                  </div>
                </div>
              </div>
              <hr className="border-white/10" />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-400">Sécurité & Compte</h3>
                <div className="space-y-3">
                  <button type="button" onClick={handleChangePassword} className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-xl p-4 text-left font-medium text-white/90 group">
                    Changer mon mot de passe
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/40 group-hover:text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => { logout(); window.location.href = "/login" }} className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-xl p-4 text-left font-medium text-white/90 group">
                    Changer de compte (Déconnexion)
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3EA6FF]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button type="button" onClick={handleDeleteAccount} className="w-full flex items-center justify-between bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20 rounded-xl p-4 text-left font-medium text-red-400 hover:text-red-300">
                    Supprimer mon compte
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6 border-t border-white/10 bg-white/5 flex gap-3 justify-end shrink-0">
              <button type="button" onClick={() => setIsSettingsOpen(false)} className="rounded-full bg-white/10 hover:bg-white/20 transition-colors px-6 py-2.5 font-bold text-white shadow-sm">
                Fermer
              </button>
              <button type="button" onClick={() => { showToast("Profil mis à jour avec succès !", "success") }} className="rounded-full bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] hover:shadow-[0_0_15px_rgba(29,108,224,0.4)] transition-all px-6 py-2.5 font-bold text-white shadow-lg">
                Enregistrer
              </button>
            </div>

            {/* In-Modal Toast Notification */}
            {toast && (
              <div
                className={`absolute bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border animate-fade-in flex items-center gap-3 z-50 text-sm font-medium
                ${toast.type === "success" ? "bg-green-500/20 border-green-500/30 text-green-400" : ""}
                ${toast.type === "error" ? "bg-red-500/20 border-red-500/30 text-red-400" : ""}
                ${toast.type === "info" ? "bg-[#1D6CE0]/20 border-[#1D6CE0]/30 text-[#3EA6FF]" : ""}
              `}
              >
                {toast.type === "success" && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                )}
                {toast.type === "error" && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                )}
                {toast.type === "info" && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="max-w-[300px] leading-snug">{toast.message}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}