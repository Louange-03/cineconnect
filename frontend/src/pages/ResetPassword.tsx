import React, { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "@tanstack/react-router"
import { resetPassword } from "../lib/auth"
import { Alert, Input, Spinner } from "../components/auth/AuthFields"

export function ResetPassword() {
  const navigate = useNavigate()
  const { token } = useParams({ from: "/reset-password/$token" })

  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => password.trim().length >= 6 && Boolean(token) && !loading, [password, token, loading])

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
    <div className="min-h-screen flex items-center justify-center px-4 relative pt-24 pb-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-ocean/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg p-16 rounded-3xl bg-navy/80 backdrop-blur-xl border border-ocean/20 shadow-2xl">
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-ocean/30 rounded-tl-3xl" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-ocean/30 rounded-br-3xl" />

        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs tracking-widest uppercase bg-ocean/20 text-frost rounded-full">
            Réinitialisation
          </span>
          <h1 className="text-4xl font-bold text-frost tracking-wide mb-4">Définir un nouveau mot de passe</h1>
          <p className="text-frost/60">Choisissez un mot de passe et validez.</p>
        </div>

        {token ? (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="space-y-2">
              <label className="text-sm text-frost/60 uppercase tracking-wider">Nouveau mot de passe</label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                className="rounded-2xl border-imperial bg-prussian/50 py-5 text-frost placeholder-frost/40 focus:border-ocean focus:shadow-[0_0_30px_rgba(14,107,168,0.2)]"
              />
            </div>

            {error ? <Alert variant="error">{error}</Alert> : null}
            {!error && success ? <Alert variant="success">{success}</Alert> : null}

            <button
              className="w-full mt-6 rounded-2xl bg-gradient-to-r from-imperial to-ocean px-6 py-5 font-semibold text-frost transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(14,107,168,0.4)] disabled:opacity-50 disabled:hover:translate-y-0"
              disabled={!canSubmit}
            >
              {loading ? <Spinner /> : "Mettre à jour"}
            </button>
          </form>
        ) : (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-200">
            Token manquant. <br />
            <Link to="/login" className="text-ocean hover:text-frost transition-colors">
              Retour à la connexion
            </Link>
          </div>
        )}

        <div className="mt-10 pt-10 border-t border-imperial/50 text-center">
          <p className="text-frost/60 text-sm">
            <button
              type="button"
              onClick={() => navigate({ to: "/login" })}
              className="text-ocean hover:text-frost transition-colors"
            >
              Revenir à la connexion
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

