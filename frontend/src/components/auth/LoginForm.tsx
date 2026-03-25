import React, { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { login } from "../../lib/auth"
import { Alert, EyeButton, Input, Spinner } from "./AuthFields"

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.trim().length > 0 && !loading,
    [email, password, loading],
  )

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      await login({ email, password })
      setSuccess("Connecté avec succès !")
      onSuccess?.()
    } catch (err: any) {
      if (err?.message?.includes("Identifiants incorrects")) {
        setError("Adresse e-mail ou mot de passe incorrect.")
      } else if (err?.message?.includes("Données invalides")) {
        setError("Veuillez remplir tous les champs correctement.")
      } else if (err?.message?.includes("Erreur serveur")) {
        setError("Erreur serveur, veuillez réessayer plus tard.")
      } else {
        setError(err?.message || "Erreur lors de la connexion.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="space-y-1">
        <label className="text-xs text-frost/60 uppercase tracking-wider">Email</label>
        <input
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-frost placeholder-frost/35 outline-none transition focus:border-[#3EA6FF]/40 focus:ring-1 focus:ring-[#1D6CE0]/35"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-frost/60 uppercase tracking-wider">Mot de passe</label>
        <Input
          className="border-imperial bg-prussian/50 pr-10 text-frost placeholder-frost/40"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          type={showPwd ? "text" : "password"}
          rightSlot={<EyeButton pressed={showPwd} onClick={() => setShowPwd((v) => !v)} />}
        />
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <button
        className="w-full mt-1 rounded-lg bg-gradient-to-r from-imperial to-ocean px-4 py-2.5 text-sm font-semibold text-frost shadow-sm transition hover:brightness-110 disabled:opacity-50 disabled:brightness-100"
        disabled={loading || !canSubmit}
        type="submit"
      >
        {loading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Spinner /> Connexion…
          </span>
        ) : (
          "Se connecter"
        )}
      </button>
    </form>
  )
}
