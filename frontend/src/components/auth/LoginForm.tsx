import React from "react"
import type { FormEvent } from "react"
import { useLoginForm } from "../../hooks/useLoginForm"
import { Alert, EyeButton, Input, Spinner } from "./AuthFields"

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { email, setEmail, password, setPassword, showPwd, toggleShowPwd, error, loading, canSubmit, submit } =
    useLoginForm({ onSuccess })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    await submit()
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
          rightSlot={<EyeButton pressed={showPwd} onClick={toggleShowPwd} />}
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
