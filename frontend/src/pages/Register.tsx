import React from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { RegisterForm } from "../components/auth/RegisterForm"

export function Register() {
  const navigate = useNavigate()
  return (
    <div className="min-h-[85vh] flex items-center justify-center relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-[#3EA6FF]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1D6CE0]/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-md w-full space-y-8 bg-[#0a1128]/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl relative z-10">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center gap-2 mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#1D6CE0] to-[#3EA6FF] shadow-[0_0_15px_rgba(29,108,224,0.4)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div className="text-2xl font-black tracking-tight font-sans">
              <span className="text-white">Créer un</span>
              <span className="text-[#1D6CE0] ml-2">Compte</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Rejoignez la communauté
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Déjà inscrit ?{" "}
            <Link to="/login" className="font-medium text-[#1D6CE0] hover:text-[#3EA6FF] transition-colors">
              Connectez-vous ici
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <RegisterForm onSuccess={() => {
            navigate({ to: "/films", state: { message: "Inscription réussie, vous êtes connecté !" } } as any)
          }} />
        </div>

      </div>
    </div>
  )
}