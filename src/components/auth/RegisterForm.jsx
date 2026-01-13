import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"

export function RegisterForm({ onSuccess }) {
  const { register } = useAuth()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
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
          await register(email, username, password)
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
        <input className="mt-1 w-full rounded border p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Username</span>
        <input className="mt-1 w-full rounded border p-2" value={username} onChange={(e) => setUsername(e.target.value)} />
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
        {loading ? "Création..." : "Créer un compte"}
      </button>
    </form>
  )
}
