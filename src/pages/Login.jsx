import { useNavigate } from "@tanstack/react-router"
import { LoginForm } from "../components/auth/LoginForm"

export function Login() {
  const navigate = useNavigate()
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold">Connexion</h1>
      <LoginForm onSuccess={() => navigate({ to: "/profil" })} />
    </div>
  )
}
