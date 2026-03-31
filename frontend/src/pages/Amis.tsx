// frontend/src/pages/Amis.tsx
import { Link } from "@tanstack/react-router"
import { FriendCard } from "../components/friends/FriendCard"
import { FriendRequestCard } from "../components/friends/FriendRequestCard"
import { useAmisPage } from "../hooks/useAmisPage"

export function Amis() {
  const { friendsError, requestsError, actionError, friends, requests, acceptMutation, rejectMutation, removeMutation, openChat } =
    useAmisPage()

  return (
    <main className="friends-page min-h-screen bg-[#050B1C] px-4 pb-20 pt-24 text-white md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
      {(friendsError || requestsError) ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Erreur de chargement de la liste d'amis. Vérifie la connexion puis recharge la page.
        </p>
      ) : null}
      {actionError ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {actionError}
        </p>
      ) : null}
      <header className="friends-hero border-b border-white/10 pb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#3EA6FF]/80">Réseau</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Mes amis</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
            Demandes entrantes et liste — même écran qu’une fiche de salle, sans fioritures.
          </p>
        </div>

        <Link
          to="/utilisateurs"
          className="inline-flex items-center gap-2 rounded-sm border border-[#3EA6FF]/50 bg-[#0A132D] px-4 py-2.5 text-sm font-semibold text-[#3EA6FF] transition hover:border-[#3EA6FF] hover:bg-[#1D6CE0]/15"
        >
          <span aria-hidden>＋</span> Trouver du monde
        </Link>
      </div>
      </header>

      <section className="friends-panel space-y-4 border-l-2 border-[#007BFF]/80 bg-[#0A132D]/35 pl-4 md:pl-5">
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Demandes reçues</h2>

        {requests.length === 0 ? (
          <p className="border border-dashed border-white/15 bg-white/[0.03] px-4 py-4 text-sm text-white/55">
            Rien en attente pour l’instant.
          </p>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <FriendRequestCard
                key={r.friendshipId}
                user={r}
                onAccept={(userId) => acceptMutation.mutate(userId)}
                onReject={(userId) => rejectMutation.mutate(userId)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="friends-panel space-y-4 border-l-2 border-white/20 bg-[#0A132D]/35 pl-4 md:pl-5">
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Ta liste</h2>

        {friends.length === 0 ? (
          <p className="border border-dashed border-white/15 bg-white/[0.03] px-4 py-4 text-sm text-white/55">
            Pas encore de contacts — passe par « Trouver du monde ».
          </p>
        ) : (
          <div className="space-y-3">
            {friends.map((f) => (
              <FriendCard
                key={f.id}
                user={f}
                onChat={openChat}
                onRemove={(userId) => removeMutation.mutate(userId)}
              />
            ))}
          </div>
        )}
      </section>
      </div>
    </main>
  )
}