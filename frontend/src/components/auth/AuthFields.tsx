import React from "react"

export function Field({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {
    return (
        <div className="space-y-1">
            <label className="ml-1 text-sm font-medium text-gray-300">{label}</label>
            {children}
        </div>
    )
}

export function Input({
    leftIcon,
    rightSlot,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
    leftIcon?: React.ReactNode
    rightSlot?: React.ReactNode
}) {
    return (
        <div className="relative">
            {leftIcon ? (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    {leftIcon}
                </div>
            ) : null}

            <input
                {...props}
                className={[
                    "w-full rounded-xl border border-white/10 bg-white/5 px-10 py-3 text-white placeholder-gray-500",
                    "outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#1D6CE0]",
                    props.className ?? "",
                ].join(" ")}
            />

            {rightSlot ? (
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    {rightSlot}
                </div>
            ) : null}
        </div>
    )
}

export function Alert({
    variant,
    children,
}: {
    variant: "error" | "success"
    children: React.ReactNode
}) {
    const styles =
        variant === "error"
            ? "text-red-200 border-red-500/20 bg-red-500/10"
            : "text-emerald-100 border-emerald-500/20 bg-emerald-500/10"

    return (
        <div className={`flex items-start gap-2 rounded-lg border p-2 text-sm ${styles}`}>
            <span className="mt-0.5 shrink-0">
                {variant === "error" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
            </span>
            <div className="min-w-0">{children}</div>
        </div>
    )
}

export function Spinner() {
    return (
        <svg
            className="h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    )
}

export function EyeButton({
    pressed,
    onClick,
}: {
    pressed: boolean
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-lg px-2 py-2 text-white/60 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            aria-label={pressed ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
            {pressed ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.477 10.477a3 3 0 104.243 4.243" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.362 7.561C5.68 8.739 4.279 10.418 3.5 12c1.636 3.5 5.37 7 8.5 7 1.185 0 2.351-.311 3.454-.85M9.88 5.2A8.02 8.02 0 0112 5c3.13 0 6.864 3.5 8.5 7-.53 1.133-1.378 2.31-2.44 3.39" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )}
        </button>
    )
}