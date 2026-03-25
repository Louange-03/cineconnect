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
    <div className="min-h-screen flex items-center justify-center px-4 relative pt-24 pb-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-ocean/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg p-16 rounded-3xl bg-navy/80 backdrop-blur-xl border border-ocean/20 shadow-2xl">
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-ocean/30 rounded-tl-3xl" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-ocean/30 rounded-br-3xl" />

        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs tracking-widest uppercase bg-ocean/20 text-frost rounded-full">
            Mot de passe
          </span>
          <h1 className="text-4xl font-bold text-frost tracking-wide mb-4">Mot de passe oublié</h1>
          <p className="text-frost/60">Entrez votre email, on vous enverra un lien de réinitialisation.</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="space-y-2">
            <label className="text-sm text-frost/60 uppercase tracking-wider">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              type="email"
              autoComplete="email"
              className="rounded-2xl border-imperial bg-prussian/50 py-5 text-frost placeholder-frost/40 focus:border-ocean focus:shadow-[0_0_30px_rgba(14,107,168,0.2)]"
            />
          </div>

          {error ? <Alert variant="error">{error}</Alert> : null}
          {!error && success ? <Alert variant="success">{success}</Alert> : null}

          {devResetUrl ? (
            <div className="rounded-2xl border border-[#FFC107]/40 bg-[#FFC107]/10 p-4 text-sm text-frost/90">
              <p className="mb-2 font-semibold text-[#FFC107]">Mode développement (SMTP non configuré)</p>
              <p className="mb-2 text-frost/70">
                Sans serveur SMTP réel, aucun email n&apos;est envoyé. Utilisez ce lien pour réinitialiser votre mot de passe :
              </p>
              <a
                href={devResetUrl}
                className="break-all text-ocean underline hover:text-frost"
              >
                {devResetUrl}
              </a>
            </div>
          ) : null}

          <button
            className="w-full mt-6 rounded-2xl bg-gradient-to-r from-imperial to-ocean px-6 py-5 font-semibold text-frost transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(14,107,168,0.4)] disabled:opacity-50 disabled:hover:translate-y-0"
            disabled={!canSubmit}
          >
            {loading ? <Spinner /> : "Envoyer le lien"}
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-imperial/50 text-center">
          <p className="text-frost/60 text-sm">
            <button
              type="button"
              onClick={() => navigate({ to: "/login" })}
              className="text-ocean hover:text-frost transition-colors"
            >
              Retour à la connexion
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

