import React from "react"
import { Link } from "@tanstack/react-router"

export function AuthShell({
    title,
    subtitle,
    icon,
    children,
    glow = "blue",
}: {
    title: string
    subtitle?: React.ReactNode
    icon: React.ReactNode
    children: React.ReactNode
    glow?: "blue" | "gold"
}) {
    return (
        <main className="relative flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            {/* Background glows */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 z-0 h-full w-full max-w-4xl -translate-x-1/2 overflow-hidden"
            >
                <div
                    className={[
                        "absolute top-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full blur-[120px]",
                        glow === "blue" ? "bg-[#1D6CE0]/10" : "bg-[#FFC107]/10",
                    ].join(" ")}
                />
                <div
                    className={[
                        "absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]",
                        glow === "blue" ? "bg-[#3EA6FF]/10" : "bg-[#FFC107]/5",
                    ].join(" ")}
                />
            </div>

            <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#0a1128]/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10 motion-safe:animate-fade-in">
                <header className="text-center">
                    <div className="mx-auto mb-6 inline-flex items-center justify-center gap-2">
                        {icon}
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-white">
                        {title}
                    </h1>

                    {subtitle ? (
                        <p className="mt-2 text-sm text-gray-400">{subtitle}</p>
                    ) : null}
                </header>

                <div className="mt-8">{children}</div>

                {/* tiny helper link */}
                <div className="mt-8 text-center text-xs text-white/35">
                    <Link
                        to="/"
                        className="transition-colors hover:text-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                    >
                        Retour à l’accueil
                    </Link>
                </div>
            </section>
        </main>
    )
}

export function BrandBadge() {
    return (
        <>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#1D6CE0] to-[#3EA6FF] shadow-[0_0_15px_rgba(29,108,224,0.35)]">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="white"
                    className="h-6 w-6"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                </svg>
            </div>
            <div className="text-2xl font-black tracking-tight">
                <span className="text-white">Ciné</span>
                <span className="text-[#1D6CE0]">Connect</span>
            </div>
        </>
    )
}

export function UserBadge() {
    return (
        <>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#1D6CE0] to-[#3EA6FF] shadow-[0_0_15px_rgba(29,108,224,0.35)]">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="white"
                    className="h-6 w-6"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                </svg>
            </div>
            <div className="text-2xl font-black tracking-tight">
                <span className="text-white">Créer un</span>
                <span className="ml-2 text-[#1D6CE0]">Compte</span>
            </div>
        </>
    )
}