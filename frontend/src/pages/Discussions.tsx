import { useState } from "react"
import { Reply, Send, X } from "lucide-react"
import { CompactSearchInput } from "../components/ui/CompactSearchInput"
import { useDiscussionPage } from "../hooks/useDiscussionPage"
import { REACTION_EMOJIS, formatMessageDayLabel, formatMessageTime, parseSharedFilmMessage, replyQuoteSummary, truncateReplySnippet } from "../utils/discussion"

function Avatar({
  name,
  src,
  selected = false,
  size = "md",
}: {
  name: string | null | undefined
  src?: string | null
  selected?: boolean
  size?: "sm" | "md"
}) {
  const [broken, setBroken] = useState(false)
  const initial = (name || "Inconnu").charAt(0).toUpperCase()
  const baseSize = size === "sm" ? "h-10 w-10" : "h-12 w-12"

  if (!src || broken) {
    return (
      <div
        className={`flex ${baseSize} shrink-0 items-center justify-center rounded-full text-lg font-bold shadow-inner ${
          selected ? "bg-white/20 text-white" : "bg-[#1D6CE0]/20 text-[#3EA6FF]"
        }`}
      >
        {initial}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name || "Utilisateur"}
      className={`${baseSize} shrink-0 rounded-full object-cover ring-1 ${
        selected ? "ring-white/40" : "ring-white/15"
      }`}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
    />
  )
}

export function Discussion() {
  const {
    selected,
    setSelected,
    messages,
    newMessage,
    setNewMessage,
    search,
    setSearch,
    typingUsers,
    shareOpen,
    setShareOpen,
    filmSearch,
    setFilmSearch,
    loadingFilms,
    reactionOpenFor,
    setReactionOpenFor,
    reactionsByMessage,
    replyingTo,
    setReplyingTo,
    currentUserId,
    handleSelectConversation,
    sendMessage,
    handleTyping,
    handleStopTyping,
    openShareFilms,
    shareFilmInCurrentChat,
    reactToMessage,
    filteredConversations,
    filteredFilms,
  } = useDiscussionPage()

  return (
    <div className="discussions-page flex h-[calc(100dvh-4rem)] min-h-[calc(100dvh-4rem)] overflow-hidden bg-[#050B1C] text-white lg:h-[calc(100dvh-5rem)] lg:min-h-[calc(100dvh-5rem)]">
      {/* Sidebar */}
      <div
        className={[
          "w-full md:flex md:max-w-[380px] md:flex-col md:border-r md:border-white/10",
          "bg-[#0A132D]/60 backdrop-blur-xl",
          selected ? "hidden md:flex" : "flex min-h-0 flex-col",
        ].join(" ")}
      >
        <div className="border-b border-white/10 bg-white/5 p-4 md:p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Messages</h2>
          <p className="text-sm text-gray-400 mt-1">Vos conversations récentes</p>
          <div className="mt-4">
            <CompactSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Rechercher une conversation…"
              inputType="search"
            />
          </div>
        </div>

        <div className="hide-scrollbar flex-1 space-y-2 overflow-y-auto p-3">
          {filteredConversations.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
              Aucun ami ne correspond a ta recherche.
            </div>
          ) : (
            filteredConversations.map((conv) => {
            const isSelected = selected?.id === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`p-4 cursor-pointer flex justify-between items-center rounded-2xl transition-all duration-300 border ${isSelected
                  ? "bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] border-transparent shadow-[0_0_20px_rgba(29,108,224,0.3)]"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <Avatar name={conv.name} src={conv.avatar_url} selected={isSelected} />
                  <div className="overflow-hidden">
                    <p className={`font-bold truncate ${isSelected ? "text-white" : "text-white/90"}`}>{conv.name || "Inconnu"}</p>
                    <p className={`text-sm truncate ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                      {conv.last_message || "Aucun message"}
                    </p>
                  </div>
                </div>

                {(conv.unread_count ?? 0) > 0 && (
                  <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                    {conv.unread_count}
                  </div>
                )}
              </div>
            );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={[
          "relative min-h-0 flex-1 flex-col bg-[#050B1C]",
          selected ? "flex" : "hidden md:flex",
        ].join(" ")}
      >
        {/* Background gradient & texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1D6CE0]/5 via-transparent to-[#3EA6FF]/5 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none" />

        {selected ? (
          <>
            {/* Chat Header */}
            <div className="z-10 flex items-center gap-3 border-b border-white/10 bg-[#0A132D]/80 p-3 backdrop-blur-md md:gap-4 md:p-6">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 md:hidden"
                aria-label="Retour aux conversations"
              >
                ←
              </button>
              <Avatar name={selected.name} src={selected.avatar_url} selected size="md" />
              <div>
                <h3 className="text-base font-bold tracking-wide text-white md:text-xl">{selected.name || "Inconnu"}</h3>
                <p className="text-sm text-[#3EA6FF] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  En ligne
                </p>
              </div>
            </div>

            {/* Messages body */}
            <div className="hide-scrollbar z-10 flex-1 space-y-4 overflow-y-auto p-3 scroll-smooth md:p-6">
              {messages.map((msg, idx) => {
                const isMine = msg.sender_id === currentUserId;
                const sharedFilm = parseSharedFilmMessage(msg.text || "")
                const rawDate = msg.created_at || msg.createdAt
                const sentAt = formatMessageTime(rawDate)
                const dayLabel = formatMessageDayLabel(rawDate)
                const msgReactions = reactionsByMessage[msg.id] ?? []
                const prevRawDate =
                  idx > 0 ? messages[idx - 1].created_at || messages[idx - 1].createdAt : undefined
                const prevDayLabel = idx > 0 ? formatMessageDayLabel(prevRawDate) : ""
                const showDaySeparator = idx === 0 || dayLabel !== prevDayLabel
                const quote = replyQuoteSummary(msg, currentUserId)
                return (
                  <div key={msg.id} id={`disc-msg-${msg.id}`}>
                    {showDaySeparator ? (
                      <div className="my-2 flex items-center justify-center">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70">
                          {dayLabel}
                        </span>
                      </div>
                    ) : null}
                    <div
                      className={`flex ${isMine ? "justify-end" : "justify-start"} motion-safe:animate-fade-in`}
                    >
                      <div
                        className={`max-w-[92%] p-3 rounded-3xl sm:max-w-[88%] sm:p-4 md:max-w-[70%] ${isMine
                          ? "bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] text-white rounded-br-sm shadow-[0_5px_20px_rgba(29,108,224,0.3)]"
                          : "bg-[#0A132D] border border-white/10 text-white/90 rounded-bl-sm shadow-xl"
                          }`}
                      >
                        {sharedFilm ? (
                          <a
                            href={sharedFilm.url}
                            target="_blank"
                            rel="noreferrer"
                            className={[
                              "block rounded-2xl border px-4 py-3 transition",
                              isMine
                                ? "border-white/30 bg-white/10 hover:bg-white/15"
                                : "border-white/15 bg-white/5 hover:bg-white/10",
                            ].join(" ")}
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                              Film partage
                            </p>
                            {sharedFilm.posterUrl ? (
                              <img
                                src={sharedFilm.posterUrl}
                                alt={sharedFilm.title}
                                className="mt-2 h-36 w-24 rounded-lg object-cover shadow-lg"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                              />
                            ) : null}
                            <p className="mt-1 text-sm font-bold text-white">{sharedFilm.title}</p>
                            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 px-2.5 py-1 text-[11px] font-medium text-white/85">
                              <span>{sharedFilm.year || "—"}</span>
                              <span>•</span>
                              <span>Ouvrir</span>
                            </div>
                          </a>
                        ) : (
                          <p className="leading-relaxed">{msg.text}</p>
                        )}

                        <div className="mt-2 flex items-center justify-end gap-2 text-[10px] font-medium text-white/70">
                          {sentAt ? <span>{sentAt}</span> : null}
                          {isMine ? (
                            <span className="inline-flex items-center gap-1">
                              {msg.seen ? (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-white/90">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                  </svg>
                                  <span>Vu</span>
                                </>
                              ) : (
                                <span>Envoye</span>
                              )}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(msg)
                              setReactionOpenFor(null)
                            }}
                            className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[11px] text-white/80 transition hover:bg-white/10"
                            title="Répondre à ce message"
                          >
                            <Reply className="h-3 w-3" aria-hidden />
                            Répondre
                          </button>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setReactionOpenFor((cur) => (cur === msg.id ? null : msg.id))
                              }
                              className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[11px] text-white/80 transition hover:bg-white/10"
                              title="Reagir"
                            >
                              🙂 React
                            </button>
                            {reactionOpenFor === msg.id ? (
                              <div className="absolute bottom-8 left-0 z-20 flex gap-1 rounded-xl border border-white/10 bg-[#0A132D] p-1.5 shadow-2xl">
                                {REACTION_EMOJIS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => reactToMessage(msg.id, emoji)}
                                    className="rounded-md px-1.5 py-1 text-base transition hover:bg-white/10"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          {msgReactions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {msgReactions.map((r) => (
                                <button
                                  key={`${msg.id}-${r.emoji}`}
                                  type="button"
                                  onClick={() => reactToMessage(msg.id, r.emoji)}
                                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] text-white/85 transition hover:bg-white/10"
                                  title="Changer ma reaction"
                                >
                                  <span>{r.emoji}</span>
                                  <span>{r.users.length}</span>
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-[#0A132D] border border-white/10 text-white/60 text-sm px-5 py-3 rounded-full flex items-center gap-2 shadow-sm">
                    En train d’écrire
                    <span className="flex gap-1 mt-1">
                      <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="z-10 bg-transparent p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:p-4">
              {replyingTo ? (
                <div className="mx-auto mb-2 flex max-w-4xl items-start gap-2 rounded-2xl border border-[#3EA6FF]/40 bg-[#0A132D]/95 px-3 py-2 shadow-lg md:rounded-xl">
                  <div className="min-w-0 flex-1 border-l-4 border-[#3EA6FF] pl-3">
                    <p className="text-[11px] font-semibold text-[#3EA6FF]">
                      Réponse à{" "}
                      {replyingTo.sender_id === currentUserId
                        ? "toi-même"
                        : selected?.name || "ce message"}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-white/75">
                      {(() => {
                        const s = parseSharedFilmMessage(replyingTo.text || "")
                        return s
                          ? `Film : ${s.title}`
                          : truncateReplySnippet(replyingTo.text || "", 140)
                      })()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="shrink-0 rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                    aria-label="Annuler la réponse"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
              <div className="mx-auto flex max-w-4xl items-center gap-1.5 rounded-2xl border border-white/10 bg-[#0A132D]/90 p-1.5 pr-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:gap-2 sm:p-2 sm:pr-2 md:gap-3 md:rounded-full md:pr-3">
                <button
                  type="button"
                  onClick={openShareFilms}
                  className="ml-0.5 flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-2 text-[10px] font-semibold text-white/85 transition hover:bg-white/10 sm:ml-1 sm:text-[11px] md:h-10 md:px-3 md:text-xs"
                  title="Partager un film"
                >
                  Partager
                </button>
                <div className="relative flex-1">
                  <input
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onBlur={handleStopTyping}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="w-full border-none bg-transparent py-2 pl-2.5 pr-10 text-sm text-white placeholder-white/40 transition-all focus:outline-none focus:ring-0 sm:py-2.5 sm:pl-4 sm:pr-12 md:py-3 md:pl-6 md:text-base"
                    placeholder="Écrivez votre message..."
                  />
                  <button className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-white/40 transition-colors hover:text-[#3EA6FF] sm:right-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm3.675 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] text-white shadow-[0_0_15px_rgba(29,108,224,0.4)] transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 md:h-10 md:w-10"
                  aria-label="Envoyer"
                >
                  <Send size={18} className="ml-0.5" />
                </button>
              </div>
            </div>

            {shareOpen && (
              <div className="px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:px-4 md:pb-3">
                <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#0A132D]/95 p-3 shadow-2xl">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Partager un film dans cette discussion</p>
                    <button
                      type="button"
                      onClick={() => setShareOpen(false)}
                      className="rounded px-2 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      Fermer
                    </button>
                  </div>
                  <CompactSearchInput
                    className="mb-2"
                    value={filmSearch}
                    onChange={setFilmSearch}
                    placeholder="Rechercher un film…"
                    inputType="search"
                  />
                  <div className="max-h-52 space-y-1 overflow-y-auto">
                    {loadingFilms ? (
                      <p className="py-3 text-center text-xs text-white/60">Chargement des films...</p>
                    ) : filteredFilms.length === 0 ? (
                      <p className="py-3 text-center text-xs text-white/60">Aucun film trouvé.</p>
                    ) : (
                      filteredFilms.map((film) => (
                        <button
                          key={film.id}
                          type="button"
                          onClick={() => shareFilmInCurrentChat(film)}
                          className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:bg-white/10"
                        >
                          <span className="text-sm font-medium text-white">{film.title}</span>
                          <span className="text-xs text-white/60">{film.year || "—"}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-white/40">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <p className="text-xl font-medium">Vos Messages</p>
            <p className="text-sm">Sélectionnez une conversation pour commencer à discuter</p>
          </div>
        )}
      </div>
    </div>
  )
}