import { useState } from "react"
import { useAuth } from "../hooks/useAuth"

type FieldState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string }

const API = "http://localhost:3001/api"

function authHeader(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
}

async function patchMe(body: { email?: string; password?: string }) {
  const res = await fetch(`${API}/users/me`, {
    method: "PATCH",
    headers: authHeader(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || "Erreur")
  }
}

function Feedback({ state }: { state: FieldState }) {
  if (state.status === "idle" || state.status === "loading") return null

  return (
    <p className={`text-sm ${state.status === "success" ? "text-green-400" : "text-red-400"}`}>
      {state.message}
    </p>
  )
}

export function Settings() {
  const { user } = useAuth()

  const [email, setEmail] = useState(user?.email ?? "")
  const [emailState, setEmailState] = useState<FieldState>({ status: "idle" })

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordState, setPasswordState] = useState<FieldState>({ status: "idle" })

  const handleEmailSubmit = async () => {
    if (!email || email === user?.email) return

    setEmailState({ status: "loading" })

    try {
      await patchMe({ email })
      setEmailState({ status: "success", message: "Email modifié !" })
    } catch (err: any) {
      setEmailState({ status: "error", message: err.message })
    }
  }

  const handlePasswordSubmit = async () => {
    if (!currentPassword || !newPassword) return

    if (newPassword.length < 6) {
      setPasswordState({ status: "error", message: "6 caractères minimum" })
      return
    }

    setPasswordState({ status: "loading" })

    try {
      await patchMe({ password: newPassword })
      setPasswordState({ status: "success", message: "Mot de passe modifié !" })
      setCurrentPassword("")
      setNewPassword("")
    } catch (err: any) {
      setPasswordState({ status: "error", message: err.message })
    }
  }

  return (
    <div className="min-h-screen bg-[#050B1C] text-white py-20 px-6">
      <div className="max-w-lg mx-auto space-y-10">

        <h1 className="text-3xl font-bold">Paramètres</h1>

        {/* EMAIL */}
        <section className="space-y-4 bg-[#0A132D] p-6 rounded-2xl border border-white/10">
          <h2 className="text-lg font-semibold text-blue-400">
            Modifier email
          </h2>

          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailState({ status: "idle" })
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
          />

          <Feedback state={emailState} />

          <button
            onClick={handleEmailSubmit}
            className="w-full bg-blue-500 py-3 rounded-xl font-bold"
          >
            Enregistrer
          </button>
        </section>

        {/* PASSWORD */}
        <section className="space-y-4 bg-[#0A132D] p-6 rounded-2xl border border-white/10">
          <h2 className="text-lg font-semibold text-red-400">
            Mot de passe
          </h2>

          <input
            type="password"
            placeholder="Mot de passe actuel"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
          />

          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
          />

          <Feedback state={passwordState} />

          <button
            onClick={handlePasswordSubmit}
            className="w-full bg-red-500 py-3 rounded-xl font-bold"
          >
            Modifier
          </button>
        </section>

      </div>
    </div>
  )
}