/**
 * Schéma Drizzle découpé par domaine (users, social, catalogue, engagement, messagerie).
 * Les imports `from "../db/schema"` restent valides via ce fichier-baril.
 */
export * from "./users.js"
export * from "./password-reset-tokens.js"
export * from "./social.js"
export * from "./catalog.js"
export * from "./engagement.js"
export * from "./messaging.js"
