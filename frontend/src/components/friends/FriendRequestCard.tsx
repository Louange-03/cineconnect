interface FriendRequestCardUser {
  id?: number;
  username: string;
  email?: string;
  requesterId?: number;
  requesterUsername?: string;
  fromUserId?: number;
}

interface FriendRequestCardProps {
  user: FriendRequestCardUser;
  onAccept: () => void;
  onReject: () => void;
}

export function FriendRequestCard({ user, onAccept, onReject }: FriendRequestCardProps) {
  const username = user.username || user.requesterUsername || "Utilisateur";
  const email = user.email || "";
  
  return (
    <div className="flex items-center justify-between gap-3 rounded border p-3">
      <div>
        <p className="font-medium">{username}</p>
        {email && <p className="text-sm text-slate-600">{email}</p>}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="rounded bg-black px-3 py-2 text-sm text-white"
          onClick={onAccept}
        >
          Accepter
        </button>
        <button
          type="button"
          className="rounded border px-3 py-2 text-sm hover:bg-slate-50"
          onClick={onReject}
        >
          Refuser
        </button>
      </div>
    </div>
  )
}
