export function MessageBubble({ message, isMine }) {
  return (
    <div
      className={`max-w-[70%] rounded px-3 py-2 text-sm ${
        isMine
          ? "ml-auto bg-black text-white"
          : "bg-slate-200"
      }`}
    >
      {message.content}
    </div>
  )
}
