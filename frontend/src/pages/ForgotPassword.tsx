import React, { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { forgotPassword } from "../lib/auth"
import { Alert, Input, Spinner } from "../components/auth/AuthFields"

export function ForgotPassword() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => email.trim().length > 0 && !loading, [email, loading])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      setDevResetUrl(null)
      const data = await forgotPassword({ email })
      setSuccess(data?.message ?? "Demande envoyée. Vérifiez votre email.")
      if (data?.resetUrl) {
        setDevResetUrl(data.resetUrl)
      }
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la demande.")
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
            Mot de passe
          </span>
          <h1 className="text-2xl font-bold text-frost tracking-wide mb-2">Mot de passe oublié</h1>
          <p className="text-frost/60 text-sm">Indiquez votre e-mail pour recevoir un lien.</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="space-y-1">
            <label className="text-xs text-frost/60 uppercase tracking-wider">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              type="email"
              autoComplete="email"
              className="border-imperial bg-prussian/50 text-frost placeholder-frost/40"
            />
          </div>

          {error ? <Alert variant="error">{error}</Alert> : null}

          {!error && devResetUrl ? (
            <div className="rounded-lg border border-[#FFC107]/40 bg-[#FFC107]/10 p-3 text-xs text-frost/90">
              <p className="mb-1 font-semibold text-[#FFC107]">Mode développement</p>
              <p className="mb-2 text-frost/80">{success ?? "Lien de réinitialisation ci-dessous."}</p>
              <a href={devResetUrl} className="break-all text-ocean underline hover:text-frost">
                {devResetUrl}
              </a>
            </div>
          ) : null}

          {!error && success && !devResetUrl ? <Alert variant="success">{success}</Alert> : null}

          <button
            className="w-full mt-1 rounded-lg bg-gradient-to-r from-imperial to-ocean px-4 py-2.5 text-sm font-semibold text-frost shadow-sm transition hover:brightness-110 disabled:opacity-50"
            disabled={!canSubmit}
            type="submit"
          >
            {loading ? <Spinner /> : "Envoyer le lien"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-imperial/50 text-center">
          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
            className="text-ocean hover:text-frost transition-colors text-xs"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  )
}
