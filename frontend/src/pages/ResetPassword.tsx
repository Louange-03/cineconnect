import React, { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "@tanstack/react-router"
import { resetPassword } from "../lib/auth"
import { Alert, EyeButton, Input, Spinner } from "../components/auth/AuthFields"

export function ResetPassword() {
  const navigate = useNavigate()
  const { token } = useParams({ from: "/reset-password/$token" })

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const passwordsMatch = password === confirmPassword && password.length >= 6
  const canSubmit = useMemo(
    () => passwordsMatch && Boolean(token) && !loading,
    [passwordsMatch, token, loading],
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const data = await resetPassword({ token, password })
      setSuccess(data?.message ?? "Mot de passe mis à jour.")
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la réinitialisation.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page min-h-screen flex items-center justify-center px-4 relative pt-24 pb-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-ocean/10 rounded-full blur-3xl pointer-events-none" />

      <div className="auth-card relative w-full max-w-md p-8 rounded-2xl bg-navy/80 backdrop-blur-xl border border-ocean/20 shadow-xl">
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-ocean/30 rounded-tl-2xl" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-ocean/30 rounded-br-2xl" />

        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 mb-3 text-[10px] tracking-widest uppercase bg-ocean/20 text-frost rounded-full">
            Réinitialisation
          </span>
          <h1 className="text-2xl font-bold text-frost tracking-wide mb-2">Nouveau mot de passe</h1>
          <p className="text-frost/60 text-sm">Choisissez un mot de passe sécurisé.</p>
        </div>

        {token ? (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <div className="space-y-1">
              <label className="text-xs text-frost/60 uppercase tracking-wider">Mot de passe</label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type={showPwd ? "text" : "password"}
                autoComplete="new-password"
                className="border-imperial bg-prussian/50 pr-10 text-frost placeholder-frost/40"
                rightSlot={<EyeButton pressed={showPwd} onClick={() => setShowPwd((v) => !v)} />}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-frost/60 uppercase tracking-wider">Confirmation</label>
              <Input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retapez…"
                type={showConfirmPwd ? "text" : "password"}
                autoComplete="new-password"
                className="border-imperial bg-prussian/50 pr-10 text-frost placeholder-frost/40"
                rightSlot={<EyeButton pressed={showConfirmPwd} onClick={() => setShowConfirmPwd((v) => !v)} />}
              />
              {confirmPassword.length > 0 ? (
                passwordsMatch ? (
                  <p className="text-[11px] text-emerald-400">OK — vous pouvez valider.</p>
                ) : (
                  <p className="text-[11px] text-red-300">Identiques, min. 6 caractères.</p>
                )
              ) : null}
            </div>

            {error ? <Alert variant="error">{error}</Alert> : null}
            {!error && success ? <Alert variant="success">{success}</Alert> : null}

            <button
              className="w-full mt-1 rounded-lg bg-gradient-to-r from-imperial to-ocean px-4 py-2.5 text-sm font-semibold text-frost shadow-sm transition hover:brightness-110 disabled:opacity-50"
              disabled={!canSubmit}
              type="submit"
            >
              {loading ? <Spinner /> : "Mettre à jour"}
            </button>
          </form>
        ) : (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-200">
            Lien invalide.{" "}
            <Link to="/login" className="text-ocean hover:text-frost">
              Connexion
            </Link>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-imperial/50 text-center">
          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
            className="text-ocean hover:text-frost transition-colors text-xs"
          >
            Revenir à la connexion
          </button>
        </div>
      </div>
    </div>
  )
}
