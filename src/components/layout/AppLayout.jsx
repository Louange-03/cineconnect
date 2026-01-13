import { Navbar } from "./Navbar"

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl p-4">
        {children}
      </main>
    </div>
  )
}
