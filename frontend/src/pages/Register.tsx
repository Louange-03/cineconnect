import { useNavigate } from "@tanstack/react-router"
import { RegisterForm } from "../components/auth/RegisterForm"

export function Register(): JSX.Element {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-ocean/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative w-full max-w-lg p-16 rounded-3xl bg-navy/80 backdrop-blur-xl border border-ocean/20 shadow-2xl">
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-ocean/30 rounded-tl-3xl" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-ocean/30 rounded-br-3xl" />
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs tracking-widest uppercase bg-ocean/20 text-frost rounded-full">
            Rejoignez-nous
          </span>
          <h1 className="text-4xl font-bold text-frost tracking-wide mb-4">Inscription</h1>
          <p className="text-frost/60">Créez votre compte cinéphile</p>
        </div>

        <RegisterForm onSuccess={() => {
          alert("Inscription réussie, vous êtes connecté !")
          navigate({ to: "/profil" })
        }} />
        <div className="mt-14 pt-10 border-t border-imperial/50 text-center">
          <p className="text-frost/60 text-sm">
            Déjà un compte ?{" "}
            <a href="/login" className="text-ocean hover:text-frost transition-colors">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}