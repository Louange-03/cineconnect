import { useAuth } from "../hooks/useAuth"
import { ProfileCard } from "../components/auth/ProfileCard"

export function Profil() {
  const { user, logout } = useAuth()

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold">Profil</h1>
      <div className="mt-4">
        <ProfileCard user={user} />
      </div>
      <button className="mt-4 rounded border px-3 py-2" onClick={logout}>
        Se déconnecter
      </button>
    </div>
  )
}
