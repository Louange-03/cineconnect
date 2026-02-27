import React from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { RegisterForm } from "../components/auth/RegisterForm"
import { AuthShell, UserBadge } from "../components/auth/AuthShell"

export function Register() {
  const navigate = useNavigate()

  return (
    <AuthShell
      title="Rejoignez la communauté"
      subtitle={
        <>
          Déjà inscrit ?{" "}
          <Link
            to="/login"
            className="font-medium text-[#1D6CE0] transition-colors hover:text-[#3EA6FF]"
          >
            Connectez-vous ici
          </Link>
        </>
      }
      icon={<UserBadge />}
      glow="blue"
    >
      <RegisterForm
        onSuccess={() => {
          navigate({
            to: "/films",
            state: { message: "Inscription réussie, vous êtes connecté !" },
          } as any)
        }}
      />
    </AuthShell>
  )
}