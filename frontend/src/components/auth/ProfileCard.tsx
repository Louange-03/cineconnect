import type { User } from "../../types"

interface ProfileCardProps {
  user: User | null
}

export function ProfileCard({ user }: ProfileCardProps): JSX.Element {
  if (!user) return <div className="rounded border p-4">Aucun utilisateur</div>

  return (
    <div className="rounded border p-4">
      <p>
        <span className="font-medium">Username:</span> {user.username}
      </p>
      <p>
        <span className="font-medium">Email:</span> {user.email}
      </p>
      <p className="mt-2 text-sm text-slate-600">
        Créé le : {new Date(user.createdAt).toLocaleString()}
      </p>
    </div>
  )
}