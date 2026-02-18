import "dotenv/config"
import jwt from "jsonwebtoken"
import type { SafeUser, JwtPayload } from "../types/index.js"

const JWT_SECRET = process.env.JWT_SECRET || "secret"

export function signToken(user: SafeUser): string {
  const payload: any = {
    id: user.id,
    email: user.email,
    username: user.username,
  }
  if (user.createdAt) payload.createdAt = user.createdAt

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}
