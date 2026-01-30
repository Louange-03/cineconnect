import { useState } from "react"
import { register } from "../../lib/auth"

export function RegisterForm({ onSuccess }) {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await register({ email, username, password })
      onSuccess?.()
    } catch (err) {
      setError(err?.message || "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div className="space-y-1">
        <label className="text-sm">Email</label>
        <input
          className="w-full rounded border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm">Username</label>
        <input
          className="w-full rounded border px-3 py-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          required
          minLength={3}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm">Mot de passe</label>
        <input
          className="w-full rounded border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          minLength={6}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? "Création..." : "Créer un compte"}
      </button>
    </form>
  )
}
