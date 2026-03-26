import React from "react"

export type CompactSearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** "search" garde le comportement recherche du navigateur ; "text" partout ailleurs */
  inputType?: "search" | "text"
  className?: string
  inputClassName?: string
  name?: string
  id?: string
  autoComplete?: string
  disabled?: boolean
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
}

const baseInput =
  "h-9 w-full rounded-md border border-white/12 bg-[#0A132D]/70 pl-8 pr-8 text-xs text-white placeholder:text-white/35 outline-none transition focus:border-[#3EA6FF]/45 focus:ring-1 focus:ring-[#3EA6FF]/25 disabled:opacity-50"

/**
 * Barre de recherche compacte unique pour tout le site (films, amis, discussions, modales).
 */
export function CompactSearchInput({
  value,
  onChange,
  placeholder = "Rechercher…",
  inputType = "text",
  className = "",
  inputClassName = "",
  name,
  id,
  autoComplete,
  disabled,
  onKeyDown,
}: CompactSearchInputProps) {
  const hasValue = value.trim().length > 0

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Escape") onChange("")
    onKeyDown?.(e)
  }

  return (
    <div className={["relative w-full", className].filter(Boolean).join(" ")}>
      <div className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-white/35" aria-hidden>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <input
        id={id}
        name={name}
        type={inputType}
        inputMode="search"
        enterKeyHint="search"
        autoComplete={autoComplete}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={[baseInput, inputClassName].filter(Boolean).join(" ")}
      />

      {hasValue && !disabled ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-1 flex items-center rounded px-1.5 text-white/40 transition hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-[#3EA6FF]/50"
          aria-label="Effacer la recherche"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  )
}
