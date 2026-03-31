// frontend/src/pages/Settings.tsx

import { useAuth } from "../hooks/useAuth"
import { type FieldState, useSettingsPage } from "../hooks/useSettingsPage"

type FeedbackProps = {
  state: FieldState
}

function Feedback({ state }: FeedbackProps) {
  if (state.status === "idle" || state.status === "loading") return null
  if (state.status === "success") {
    return <p className="text-sm text-green-500">{state.message}</p>
  }
  return <p className="text-sm text-red-500">{state.message}</p>
}

export function Settings() {
  const { user } = useAuth()
  const {
    email,
    setEmail,
    emailState,
    setEmailState,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    passwordState,
    setPasswordState,
    handleEmailSubmit,
    handlePasswordSubmit,
  } = useSettingsPage(user?.email ?? "")

  return (
    <div className="max-w-lg mx-auto space-y-8 py-4">
      <h1 className="text-2xl font-semibold text-white">Paramètres</h1>

      {/* Section email */}
      <section className="space-y-3">
        <h2 className="text-base font-medium text-slate-300">
          Changer d'email
        </h2>

        <div className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailState({ status: "idle" })
            }}
            placeholder="Nouvel email"
            className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Feedback state={emailState} />
          <button
            type="button"
            onClick={() => void handleEmailSubmit(user?.email)}
            disabled={emailState.status === "loading"}
            className="rounded bg-white px-4 py-2 text-sm font-medium text-black hover:bg-slate-200 transition disabled:opacity-40"
          >
            {emailState.status === "loading" ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </section>

      <hr className="border-slate-700" />
      <section className="space-y-3">
        <h2 className="text-base font-medium text-slate-300">
          Changer de mot de passe
        </h2>

        <div className="space-y-2">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value)
              setPasswordState({ status: "idle" })
            }}
            placeholder="Mot de passe actuel"
            className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value)
              setPasswordState({ status: "idle" })
            }}
            placeholder="Nouveau mot de passe"
            className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Feedback state={passwordState} />
          <button
            type="button"
            onClick={handlePasswordSubmit}
            disabled={passwordState.status === "loading"}
            className="rounded bg-white px-4 py-2 text-sm font-medium text-black hover:bg-slate-200 transition disabled:opacity-40"
          >
            {passwordState.status === "loading" ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </section>
    </div>
  )
}