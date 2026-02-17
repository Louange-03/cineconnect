import "dotenv/config"
import jwt from "jsonwebtoken"

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m"
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d"

function requireSecret(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

export function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    requireSecret("JWT_ACCESS_SECRET"),
    { expiresIn: ACCESS_EXPIRES_IN }
  )
}

export function signRefreshToken(user) {
  return jwt.sign(
    { id: user.id, tokenVersion: user.tokenVersion },
    requireSecret("JWT_REFRESH_SECRET"),
    { expiresIn: REFRESH_EXPIRES_IN }
  )
}

export function verifyAccessToken(token) {
  return jwt.verify(token, requireSecret("JWT_ACCESS_SECRET"))
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, requireSecret("JWT_REFRESH_SECRET"))
}
