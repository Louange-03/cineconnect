import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"

export function LoginForm({ onSuccess }) {
  const { login } = useAuth()
  const [email, setEmail] = useState("demo@cineconnect.dev")
  const [password, setPassword] = useState("demo")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
          await login(email, password)
          onSuccess?.()
        } catch (err) {
          setError(err?.message || "Erreur")
        } finally {
          setLoading(false)
        }
      }}
    >
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input
          className="mt-1 w-full rounded border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Mot de passe</span>
        <input
          className="mt-1 w-full rounded border p-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button className="w-full rounded bg-black px-3 py-2 text-white disabled:opacity-60" disabled={loading}>
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  )
}
