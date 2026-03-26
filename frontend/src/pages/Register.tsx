import React from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { RegisterForm } from "../components/auth/RegisterForm"

export function Register() {
  const navigate = useNavigate()

  return (
    <div className="auth-page min-h-screen flex items-center justify-center px-4 relative pt-24 pb-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-ocean/10 rounded-full blur-3xl pointer-events-none" />
      <div className="auth-card relative w-full max-w-md p-8 rounded-2xl bg-navy/80 backdrop-blur-xl border border-ocean/20 shadow-xl">
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-ocean/30 rounded-tl-2xl" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-ocean/30 rounded-br-2xl" />
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 mb-3 text-[10px] tracking-widest uppercase bg-ocean/20 text-frost rounded-full">
            Rejoignez-nous
          </span>
          <h1 className="text-2xl font-bold text-frost tracking-wide mb-2">Inscription</h1>
          <p className="text-frost/60 text-sm">Créez votre compte cinéphile</p>
        </div>

        <RegisterForm onSuccess={() => {
          navigate({
            to: "/profil",
            state: { message: "Inscription réussie, vous êtes connecté !" },
          } as any)
        }} />
        <div className="mt-8 pt-6 border-t border-imperial/50 text-center">
          <p className="text-frost/60 text-xs">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-ocean hover:text-frost transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
