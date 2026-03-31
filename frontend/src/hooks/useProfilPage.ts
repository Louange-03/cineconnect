import { useEffect, useState } from "react"
import { logout } from "../lib/auth"
import { deleteMyAccount, fetchMyFavorites, type FavoriteFilm, updateMyPassword } from "../services/profile.service"

type Toast = { message: string; type: "success" | "error" | "info" }

export function useProfilPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [favoriteFilms, setFavoriteFilms] = useState<FavoriteFilm[]>([])
  const [avatar, setAvatar] = useState<string | null>(localStorage.getItem("user_avatar"))
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = (message: string, type: Toast["type"] = "success") => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 4000)
  }

  async function handleChangePassword() {
    const currentPass = prompt("Entrez votre mot de passe actuel :")
    if (!currentPass) return
    const newPass = prompt("Entrez votre NOUVEAU mot de passe :")
    if (!newPass || newPass.length < 6) {
      showToast("Le mot de passe doit faire au moins 6 caractères.", "error")
      return
    }
    try {
      await updateMyPassword(newPass)
      showToast("Mot de passe modifié avec succès !", "success")
    } catch {
      showToast("La modification a échoué. Veuillez réessayer.", "error")
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm("C'est définitif. Êtes-vous ABSOLUMENT sûr de vouloir supprimer votre compte ?")) return
    try {
      await deleteMyAccount()
      logout()
      window.location.href = "/register"
    } catch {
      showToast("Opération impossible à cause des données liées.", "error")
    }
  }

  useEffect(() => {
    const syncFavorites = async () => {
      try {
        setFavoriteFilms(await fetchMyFavorites())
      } catch {
        // keep silent to preserve UX
      }
    }
    syncFavorites()
    window.addEventListener("favorites-changed", syncFavorites)
    return () => window.removeEventListener("favorites-changed", syncFavorites)
  }, [])

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
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

  function logoutAndGoLogin() {
    logout()
    window.location.href = "/login"
  }

  return {
    isSettingsOpen,
    setIsSettingsOpen,
    favoriteFilms,
    avatar,
    toast,
    showToast,
    handleChangePassword,
    handleDeleteAccount,
    handleAvatarChange,
    logoutAndGoLogin,
  }
}
