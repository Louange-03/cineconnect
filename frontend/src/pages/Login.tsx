import React from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { LoginForm } from "../components/auth/LoginForm"

export function Login() {
  const navigate = useNavigate()
  return (
    <div className="min-h-[85vh] flex items-center justify-center relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#1D6CE0]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FFC107]/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-md w-full space-y-8 bg-[#0a1128]/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl relative z-10">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center gap-2 mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#1D6CE0] to-[#3EA6FF] shadow-[0_0_15px_rgba(29,108,224,0.4)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <div className="text-2xl font-black tracking-tight font-sans">
              <span className="text-white">Ciné</span>
              <span className="text-[#1D6CE0]">Connect</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Bon retour parmi nous
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Ou{" "}
            <Link to="/register" className="font-medium text-[#1D6CE0] hover:text-[#3EA6FF] transition-colors">
              créez un nouveau compte
            </Link>{" "}
            gratuitement
          </p>
        </div>

        <div className="mt-8">
          <LoginForm onSuccess={() => {
            navigate({ to: "/films" })
          }} />
        </div>

      </div>
    </div>
  )
}