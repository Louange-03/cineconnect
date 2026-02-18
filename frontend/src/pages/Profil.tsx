import { useAuth } from "../hooks/useAuth"

export function Profil() {
  const { user, isLoading, error } = useAuth()

  if (isLoading) return <p className="text-slate-600">Chargement...</p>
  if (error) return <p className="text-red-600">{(error as any).message}</p>

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Profil</h1>
      {user ? (
        <div className="rounded border p-4">
          <p><span className="font-medium">ID :</span> {user.id}</p>
          <p><span className="font-medium">Email :</span> {user.email}</p>
          <p><span className="font-medium">Username :</span> {user.username}</p>
        </div>
      ) : (
        <p className="text-slate-600">Aucun utilisateur.</p>
      )}
    </div>
  )
}
