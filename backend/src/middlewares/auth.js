import { verifyAccessToken } from "../utils/tokens.js"

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ""
  const [type, token] = header.split(" ")

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Non autorisé" })
  }

  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    return res.status(401).json({ message: "Token invalide" })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user?.role) return res.status(403).json({ message: "Accès refusé" })
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" })
    }
    next()
  }
}
