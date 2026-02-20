import { useNavigate } from "@tanstack/react-router"
import { RegisterForm } from "../components/auth/RegisterForm"

export function Register(): JSX.Element {
  const navigate = useNavigate()
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Inscription</h1>
      <RegisterForm onSuccess={() => {
        navigate({ to: "/profil" }, { state: { message: "Inscription réussie, vous êtes connecté !" } })
      }} />
    </div>
  )
}