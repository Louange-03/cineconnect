import { useNavigate } from "@tanstack/react-router"
import { RegisterForm } from "../components/auth/RegisterForm"

export function Register() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Inscription</h1>
          <p className="mt-1 text-sm text-slate-600">
            Crée ton compte pour noter des films et discuter avec tes amis.
          </p>
        </div>

        <RegisterForm onSuccess={() => navigate({ to: "/profil" })} />

        <p className="mt-6 text-sm text-slate-600">
          Déjà un compte ?{" "}
          <a className="font-medium text-slate-900 underline" href="/login">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  )
}
