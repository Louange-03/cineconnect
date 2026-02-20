import { useState, FormEvent } from "react"
import { login } from "../../lib/authApi"

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps): JSX.Element {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
      setSuccess("Connecté avec succès !")
      onSuccess?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="space-y-2">
        <label className="text-sm text-frost/60 uppercase tracking-wider">Email</label>
        <input
          className="w-full rounded-2xl border border-imperial bg-prussian/50 px-6 py-5 text-frost placeholder-frost/40 outline-none transition-all focus:border-ocean focus:bg-prussian focus:shadow-[0_0_30px_rgba(14,107,168,0.2)]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-frost/60 uppercase tracking-wider">Mot de passe</label>
        <input
          className="w-full rounded-2xl border border-imperial bg-prussian/50 px-6 py-5 text-frost placeholder-frost/40 outline-none transition-all focus:border-ocean focus:bg-prussian focus:shadow-[0_0_30px_rgba(14,107,168,0.2)]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          type="password"
        />
      </div>

      {error && (
        <div className="px-5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="px-5 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          {success}
        </div>
      )}

      <button
        className="w-full mt-6 rounded-2xl bg-gradient-to-r from-imperial to-ocean px-6 py-5 font-semibold text-frost transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(14,107,168,0.4)] disabled:opacity-50 disabled:hover:translate-y-0"
        disabled={loading}
      >
        {loading ? "Connexion en cours..." : "Se connecter"}
      </button>
    </form>
  )
}