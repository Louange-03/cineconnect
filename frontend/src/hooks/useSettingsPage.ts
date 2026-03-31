import { useState } from "react"
import { patchMe } from "../services/settings.service"

export type FieldState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string }

export function useSettingsPage(initialEmail: string) {
  const [email, setEmail] = useState(initialEmail)
  const [emailState, setEmailState] = useState<FieldState>({ status: "idle" })
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordState, setPasswordState] = useState<FieldState>({ status: "idle" })

  const handleEmailSubmit = async (currentEmail?: string): Promise<void> => {
    if (!email.trim() || email === currentEmail) return
    setEmailState({ status: "loading" })
    try {
      await patchMe({ email })
      setEmailState({ status: "success", message: "Email mis à jour !" })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur"
      setEmailState({ status: "error", message })
    }
  }

  const handlePasswordSubmit = async (): Promise<void> => {
    if (!currentPassword || !newPassword) return
    if (newPassword.length < 6) {
      setPasswordState({ status: "error", message: "Le mot de passe doit faire au moins 6 caractères" })
      return
    }
    setPasswordState({ status: "loading" })
    try {
      await patchMe({ password: newPassword })
      setPasswordState({ status: "success", message: "Mot de passe mis à jour !" })
      setCurrentPassword("")
      setNewPassword("")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur"
      setPasswordState({ status: "error", message })
    }
  }

  return {
    email,
    setEmail,
    emailState,
    setEmailState,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    passwordState,
    setPasswordState,
    handleEmailSubmit,
    handlePasswordSubmit,
  }
}
