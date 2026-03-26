import React, { useEffect, useState } from "react"

/** Gris neutre si tout échoue (pas de requête réseau) */
const SVG_FALLBACK =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect fill="#0f172a" width="400" height="600"/><text x="50%" y="50%" fill="#64748b" font-family="system-ui,sans-serif" font-size="14" text-anchor="middle" dy=".3em">Cinéma</text></svg>`
  )

/** Cache des URLs d'images déjà en 404 pour éviter les retries réseau répétés. */
const BROKEN_IMAGE_URLS = new Set<string>()

function sanitizeRemoteImageUrl(raw: string): string | null {
  const value = raw.trim()
  if (!value || value === "N/A") return null
  return value
}

type SafeImageProps = {
  src: string
  alt: string
  className?: string
  /** Seed picsum.photos si `src` échoue (stable par affiche) */
  fallbackSeed: string
  sizes?: string
  loading?: "lazy" | "eager"
  onLoad?: () => void
}

/**
 * Image TMDB / Unsplash : referrerPolicy évite les blocages navigateur.
 * Chaîne de secours : src → picsum → SVG local.
 */
export function SafeImage({
  src,
  alt,
  className = "",
  fallbackSeed,
  sizes,
  loading = "lazy",
  onLoad,
}: SafeImageProps) {
  const primarySrc = sanitizeRemoteImageUrl(src)
  const startsBroken = primarySrc ? BROKEN_IMAGE_URLS.has(primarySrc) : true
  const [step, setStep] = useState<0 | 1 | 2>(startsBroken ? 1 : 0)

  useEffect(() => {
    const nextPrimary = sanitizeRemoteImageUrl(src)
    if (!nextPrimary) {
      setStep(1)
      return
    }
    setStep(BROKEN_IMAGE_URLS.has(nextPrimary) ? 1 : 0)
  }, [src])

  const currentSrc =
    step === 0
      ? (primarySrc ?? SVG_FALLBACK)
      : step === 1
        ? `https://picsum.photos/seed/${encodeURIComponent(fallbackSeed)}/400/600`
        : SVG_FALLBACK

  return (
    <img
      key={currentSrc}
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading}
      sizes={sizes}
      referrerPolicy="no-referrer"
      decoding="async"
      onLoad={() => onLoad?.()}
      onError={() => {
        if (step === 0 && primarySrc) {
          BROKEN_IMAGE_URLS.add(primarySrc)
        }
        setStep((s) => (s < 2 ? ((s + 1) as 0 | 1 | 2) : 2))
      }}
    />
  )
}

type BackdropProps = {
  src: string
  fallbackSeed: string
  className?: string
  overlayClassName?: string
  /** Zoom léger type Ken Burns (désactivé si préférence “réduire les animations”) */
  kenBurns?: boolean
  children?: React.ReactNode
}

/** Fond plein écran : &lt;img&gt; + overlays (plus fiable que background-image seul) */
export function BackdropLayer({
  src,
  fallbackSeed,
  className = "",
  overlayClassName = "",
  kenBurns = true,
  children,
}: BackdropProps) {
  const [loaded, setLoaded] = useState(false)
  const [step, setStep] = useState<0 | 1>(0)
  const [broken, setBroken] = useState(false)

  useEffect(() => {
    setLoaded(false)
  }, [step])

  const currentSrc =
    step === 0
      ? src
      : `https://picsum.photos/seed/${encodeURIComponent(fallbackSeed)}/1920/1080`

  return (
    <>
      {!broken && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            key={currentSrc}
            src={currentSrc}
            alt=""
            aria-hidden
            className={[
              "h-full min-h-full w-full min-w-full object-cover transition-opacity duration-700",
              loaded ? "opacity-100" : "opacity-0",
              kenBurns ? "home-backdrop-kenburns" : "",
              className,
            ].join(" ")}
            loading="eager"
            referrerPolicy="no-referrer"
            decoding="async"
            onLoad={() => setLoaded(true)}
          onError={() => {
            if (step === 0) setStep(1)
            else {
              setBroken(true)
              setLoaded(true)
            }
          }}
          />
        </div>
      )}
      {!loaded && !broken && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#0a1628] to-[#050505] motion-safe:animate-pulse"
          aria-hidden
        />
      )}
      {broken && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#0a1628] to-[#050505]"
          aria-hidden
        />
      )}
      {overlayClassName ? (
        <div className={["absolute inset-0", overlayClassName].join(" ")} aria-hidden />
      ) : null}
      {children}
    </>
  )
}
