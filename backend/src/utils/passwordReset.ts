import crypto from "crypto"

export function hashPasswordResetToken(token: string): string {
  // We store only the hash of the token (never the raw token) to reduce blast radius.
  return crypto.createHash("sha256").update(token).digest("hex")
}

export function createPasswordResetToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString("hex")
  const tokenHash = hashPasswordResetToken(rawToken)
  return { rawToken, tokenHash }
}

