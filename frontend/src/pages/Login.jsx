import { useNavigate } from "@tanstack/react-router"
import { LoginForm } from "../components/auth/LoginForm"

export function Login() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
          <p className="mt-1 text-sm text-slate-600">
            Content de te revoir. Connecte-toi pour continuer.
          </p>
        </div>

        <LoginForm onSuccess={() => navigate({ to: "/profil" })} />

        <p className="mt-6 text-sm text-slate-600">
          Pas encore de compte ?{" "}
          <a className="font-medium text-slate-900 underline" href="/register">
            Créer un compte
          </a>
        </p>
      </div>
    </div>
  )
}
