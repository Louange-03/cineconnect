import React from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { LoginForm } from "../components/auth/LoginForm"
import { AuthShell, BrandBadge } from "../components/auth/AuthShell"

export function Login() {
  const navigate = useNavigate()

  return (
    <AuthShell
      title="Bon retour parmi nous"
      subtitle={
        <>
          Ou{" "}
          <Link
            to="/register"
            className="font-medium text-[#1D6CE0] transition-colors hover:text-[#3EA6FF]"
          >
            créez un nouveau compte
          </Link>{" "}
          gratuitement
        </>
      }
      icon={<BrandBadge />}
      glow="gold"
    >
      <LoginForm
        onSuccess={() => {
          navigate({ to: "/films" })
        }}
      />
    </AuthShell>
  )
}