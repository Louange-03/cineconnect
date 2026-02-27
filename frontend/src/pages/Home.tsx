import React from "react"
import { Link } from "@tanstack/react-router"

export function Home() {
  return (
    <main className="relative min-h-[90vh] overflow-hidden bg-[#050B1C]">
      <Background />

      <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center">
        <Badge />

        <header className="max-w-5xl">
          <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-2xl leading-[1.05] sm:text-7xl md:text-8xl">
            Découvrez, notez <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-[#1D6CE0] via-[#3EA6FF] to-[#00f2fe] bg-clip-text text-transparent [background-size:200%_200%] motion-safe:animate-[gradient_6s_ease_infinite] drop-shadow-lg">
              échangez.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg font-light leading-relaxed text-gray-300 md:text-2xl">
            Rejoignez <strong className="font-semibold text-white">CinéConnect</strong> pour explorer un catalogue infini,
            discuter avec vos amis en temps réel et partager votre passion du 7ème art dans un espace conçu pour vous.
          </p>
        </header>

        <div className="mt-12 flex w-full flex-col items-center justify-center gap-6 sm:flex-row">
          <PrimaryCta />
          <SecondaryCta />
        </div>

        <Metrics />
      </section>

      {/* Local keyframes (no config Tailwind needed) */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-16px) rotate(var(--r, 0deg)); }
        }
      `}</style>
    </main>
  )
}

function Background() {
  return (
    <>
      {/* Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div className="absolute left-1/2 top-0 h-full w-full max-w-7xl -translate-x-1/2 overflow-hidden">
          <div className="absolute left-[-10%] top-[-20%] h-[60%] w-[60%] rounded-full bg-[#1D6CE0]/20 blur-[150px] mix-blend-screen motion-safe:animate-pulse [animation-duration:6s]" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[50%] w-[50%] rounded-full bg-[#FFC107]/15 blur-[150px] mix-blend-screen motion-safe:animate-pulse [animation-duration:8s]" />
        </div>
      </div>

      {/* Floating cards */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-30"
      >
        <FloatingCard className="left-[10%] top-[15%] h-60 w-40 bg-gradient-to-tr from-[#1D6CE0] to-transparent shadow-[0_0_50px_rgba(29,108,224,0.45)] [--r:-12deg] [animation-duration:9s]" />
        <FloatingCard className="right-[8%] top-[40%] h-72 w-48 bg-gradient-to-bl from-[#FFC107] to-transparent shadow-[0_0_50px_rgba(255,193,7,0.28)] [--r:8deg] [animation-duration:11s]" />
        <FloatingCard className="bottom-[20%] left-[20%] h-48 w-32 bg-gradient-to-t from-pink-500 to-transparent shadow-[0_0_30px_rgba(236,72,153,0.28)] [--r:15deg] [animation-duration:10s]" />
      </div>

      {/* Subtle vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),rgba(5,11,28,0.85)_55%,rgba(5,11,28,1)_100%)]"
      />
    </>
  )
}

function FloatingCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "absolute rounded-2xl border border-white/10 blur-[2px]",
        "motion-safe:animate-[float_ease-in-out_infinite]",
        "will-change-transform",
        className,
      ].join(" ")}
      style={{
        animationName: "float",
      }}
    />
  )
}

function Badge() {
  return (
    <div className="mb-8 inline-flex cursor-default items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#FFC107] backdrop-blur-md shadow-[0_0_20px_rgba(255,193,7,0.10)] transition-colors hover:bg-white/10">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#FFC107] opacity-75 motion-safe:animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FFC107]" />
      </span>
      La plateforme communautaire n°1 des cinés
    </div>
  )
}

function PrimaryCta() {
  return (
    <Link
      to="/films"
      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-[#1D6CE0] px-10 py-5 text-lg font-bold text-white shadow-[0_0_30px_rgba(29,108,224,0.45)] transition-all duration-300 hover:-translate-y-2 hover:bg-[#3EA6FF] hover:shadow-[0_0_40px_rgba(29,108,224,0.65)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3EA6FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C] sm:w-auto md:text-xl"
      aria-label="Explorer le catalogue de films"
    >
      <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 ease-out group-hover:translate-y-0" />
      <span className="relative flex items-center gap-2">
        Explorer le catalogue
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="h-6 w-6 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </span>
    </Link>
  )
}

function SecondaryCta() {
  return (
    <Link
      to="/register"
      className="flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-10 py-5 text-lg font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C] sm:w-auto md:text-xl"
      aria-label="Créer un compte gratuitement"
    >
      Rejoindre gratuitement
    </Link>
  )
}

function Metrics() {
  const items = [
    { value: "+1M", label: "Films indexés" },
    { value: "Live", label: "Chat temps réel" },
    { value: "100%", label: "Gratuit" },
    { value: "Pro", label: "Design sombre" },
  ]

  return (
    <div className="mt-24 w-full max-w-4xl border-t border-white/10 pt-12">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-16">
        {items.map((it) => (
          <div key={it.label} className="text-center">
            <div className="mb-2 text-4xl font-black text-white">{it.value}</div>
            <div className="text-sm font-medium uppercase tracking-wider text-gray-400">
              {it.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}