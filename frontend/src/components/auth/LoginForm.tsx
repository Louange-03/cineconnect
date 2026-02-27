import React, { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { login } from "../../lib/auth"
import { Alert, EyeButton, Field, Input, Spinner } from "./AuthFields"

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
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
      setError(err?.message || "Erreur lors de la connexion.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      <Field label="Adresse e-mail">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
          autoComplete="email"
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          }
        />
      </Field>

      <Field label="Mot de passe">
        <Input
          type={showPwd ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          }
          rightSlot={<EyeButton pressed={showPwd} onClick={() => setShowPwd((v) => !v)} />}
        />
      </Field>

      <div className="mt-2 flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="rounded border-white/10 bg-white/5 text-[#1D6CE0] focus:ring-[#1D6CE0]"
          />
          <span className="text-sm text-gray-400">Se souvenir de moi</span>
        </label>

        <a
          href="#"
          className="text-sm text-[#1D6CE0] transition-colors hover:text-[#3EA6FF]"
        >
          Mot de passe oublié ?
        </a>
      </div>

      <div className="min-h-[24px]">
        {error ? <Alert variant="error">{error}</Alert> : null}
        {!error && success ? <Alert variant="success">{success}</Alert> : null}
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="group relative w-full overflow-hidden rounded-xl bg-[#1D6CE0] py-3 font-bold text-white shadow-[0_0_20px_rgba(29,108,224,0.3)] transition-all hover:-translate-y-0.5 hover:bg-[#3EA6FF] hover:shadow-[0_0_25px_rgba(29,108,224,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 ease-out group-hover:translate-y-0" />
        <span className="relative flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Spinner /> Connexion…
            </>
          ) : (
            "Se connecter"
          )}
        </span>
      </button>
    </form>
  )
}