export type ThemeMode = "dark" | "light"

const THEME_KEY = "theme-mode"

function getSystemTheme(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
}

export function getTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark"
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === "dark" || saved === "light") return saved
  return getSystemTheme()
}

export function applyTheme(theme: ThemeMode): void {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.classList.toggle("theme-light", theme === "light")
  root.classList.toggle("theme-dark", theme === "dark")
  root.style.colorScheme = theme
}

export function setTheme(theme: ThemeMode): void {
  if (typeof window === "undefined") return
  localStorage.setItem(THEME_KEY, theme)
  applyTheme(theme)
  window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme } }))
}

export function toggleTheme(): ThemeMode {
  const next: ThemeMode = getTheme() === "dark" ? "light" : "dark"
  setTheme(next)
  return next
}

export function initTheme(): void {
  applyTheme(getTheme())
}
