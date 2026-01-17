import { Link } from "@tanstack/react-router"

function NavItem({ to, children }) {
  return (
    <Link
      to={to}
      className="rounded px-3 py-2 text-sm hover:bg-slate-100"
      activeProps={{ className: "bg-slate-200 font-medium" }}
    >
      {children}
    </Link>
  )
}

export function Navbar() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-semibold">
          CinéConnect
        </Link>

        <nav className="flex items-center gap-2">
          <NavItem to="/films">Films</NavItem>
          <NavItem to="/discussion">Discussion</NavItem>
          <NavItem to="/profil">Profil</NavItem>
          <NavItem to="/login">Login</NavItem>
        </nav>
      </div>
    </header>
  )
}
