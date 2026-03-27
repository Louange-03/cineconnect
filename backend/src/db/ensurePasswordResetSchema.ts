import { pool } from "./client"

/**
 * Garantit que la table password_reset_tokens existe (idempotent).
 * Évite les 500 si `db:migrate` n'a pas été exécuté après déploiement.
 */
export async function ensurePasswordResetSchema(): Promise<void> {
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`)
  } catch (e) {
    console.warn(
      "[db] CREATE EXTENSION pgcrypto ignoré (droits ou déjà présent):",
      (e as Error).message
    )
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL,
      "token_hash" varchar(64) NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "expires_at" timestamp NOT NULL,
      "used_at" timestamp
    )
  `)

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_hash_unique"
    ON "password_reset_tokens" ("token_hash")
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_id_idx"
    ON "password_reset_tokens" ("user_id")
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS "password_reset_tokens_expires_at_idx"
    ON "password_reset_tokens" ("expires_at")
  `)

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'password_reset_tokens_user_id_users_id_fk'
      ) THEN
        ALTER TABLE "password_reset_tokens"
          ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk"
          FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
      END IF;
    END $$;
  `)
}
