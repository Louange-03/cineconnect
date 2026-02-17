import type { Request, Response, NextFunction } from "express"
import { verifyToken } from "../utils/tokens.js"

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || ""
  const [type, token] = header.split(" ")

  if (type !== "Bearer" || !token) {
    res.status(401).json({ message: "Non autorisé" })
    return
  }

  try {
    req.user = verifyToken(token)
    next()
  } catch {
    res.status(401).json({ message: "Token invalide" })
  }
}
