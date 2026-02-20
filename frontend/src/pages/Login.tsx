import { useNavigate } from "@tanstack/react-router"
import { LoginForm } from "../components/auth/LoginForm"

export function Login(): JSX.Element {
  const navigate = useNavigate()
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Connexion</h1>
      <LoginForm onSuccess={() => {
        navigate({ to: "/profil" }, { state: { message: "Vous êtes bien connecté !" } })
      }} />
    </div>
  )
}