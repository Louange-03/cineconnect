import React, { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { register } from "../../lib/auth"
import { Alert, EyeButton, Field, Input, Spinner } from "./AuthFields"

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const passwordsMatch = password === confirmPassword && password.length >= 6

  const canSubmit = useMemo(() => {
    return (
      email.trim().length > 0 &&
      username.trim().length >= 3 &&
      passwordsMatch &&
      !loading
    )
  }, [email, username, passwordsMatch, loading])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await register({ email, username, password })
      onSuccess?.()
    } catch (err: any) {
      if (err?.message?.includes("déjà utilisé")) {
        setError("Email ou nom d'utilisateur déjà utilisé.")
      } else if (err?.message?.includes("Données invalides")) {
        setError("Veuillez remplir tous les champs correctement.")
      } else if (err?.message?.includes("Erreur serveur")) {
        setError("Erreur serveur, veuillez réessayer plus tard.")
      } else {
        setError(err?.message || "Erreur lors de l'inscription.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-3.5">
      <Field label="Adresse e-mail">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
          autoComplete="email"
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          }
        />
      </Field>

      <Field label="Nom d'utilisateur">
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Votre pseudo"
          autoComplete="username"
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3 3 0 11-6 0 3 3 0 016 0zm-12 12a9 9 0 1118 0H3.75z" />
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
          autoComplete="new-password"
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          }
          rightSlot={<EyeButton pressed={showPwd} onClick={() => setShowPwd((v) => !v)} />}
          className="pr-10"
        />
        <p className="ml-0.5 mt-0.5 text-[11px] text-gray-500">Au moins 6 caractères.</p>
      </Field>

      <Field label="Confirmer le mot de passe">
        <Input
          type={showConfirmPwd ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Retapez le mot de passe"
          autoComplete="new-password"
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          }
          rightSlot={<EyeButton pressed={showConfirmPwd} onClick={() => setShowConfirmPwd((v) => !v)} />}
          className="pr-10"
        />
        {confirmPassword.length > 0 ? (
          passwordsMatch ? (
            <p className="ml-1 mt-1 text-xs text-emerald-400">Les mots de passe correspondent — vous pouvez valider.</p>
          ) : (
            <p className="ml-1 mt-1 text-xs text-red-300">Les deux champs doivent être identiques (min. 6 caractères).</p>
          )
        ) : null}
      </Field>

      <div className="min-h-[20px]">
        {error ? <Alert variant="error">{error}</Alert> : null}
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full mt-2 rounded-lg bg-gradient-to-r from-imperial to-ocean px-4 py-2.5 text-sm font-semibold text-frost shadow-sm transition hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100"
      >
        {loading ? <Spinner /> : "S'inscrire"}
      </button>
    </form>
  )
}