export function MessageBubble({ message, isMine }) {
  return (
    <div
      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
        isMine
          ? "ml-auto bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--primary-600)] text-white"
          : "border border-[color:var(--border)] bg-[color:var(--surface-solid)] text-[color:var(--text)]"
      }`}
    >
      {message.content}
    </div>
  )
}
