import { Outlet } from "@tanstack/react-router"
import { Navbar } from "./Navbar"
import { Container } from "./Container"

export function AppLayout(): JSX.Element {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Container>
        <Outlet />
      </Container>
    </div>
  )
}