import { Outlet } from "@tanstack/react-router"
import { Navbar } from "./Navbar"
import { Container } from "./Container"

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Container>
        <Outlet />
      </Container>
    </div>
  )
}
