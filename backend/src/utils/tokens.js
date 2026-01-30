import "dotenv/config"
import jwt from "jsonwebtoken"

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}
