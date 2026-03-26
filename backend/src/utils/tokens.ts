import "dotenv/config"
import jwt from "jsonwebtoken"
import type { SafeUser, JwtPayload } from "../types/index.js"

const JWT_SECRET = process.env.JWT_SECRET || "secret"

export function signToken(user: SafeUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  )
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}
