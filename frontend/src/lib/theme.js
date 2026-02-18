const THEME_KEY = "cineconnect_theme"

export function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === "light" || stored === "dark") return stored

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")
    ?.matches
  return prefersDark ? "dark" : "light"
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme)
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme)
  applyTheme(theme)
}

export function initTheme() {
  const theme = getInitialTheme()
  applyTheme(theme)
  return theme
}
