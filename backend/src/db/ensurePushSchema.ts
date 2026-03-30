import { pool } from "./client"

export async function ensurePushSchema(): Promise<void> {
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`)
  } catch (e) {
    console.warn(
      "[db] CREATE EXTENSION pgcrypto ignoré (droits ou déjà présent):",
      (e as Error).message,
    )
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "push_subscriptions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL,
      "endpoint" text NOT NULL,
      "p256dh" text NOT NULL,
      "auth" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )
  `)

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "push_subscriptions_endpoint_unique"
    ON "push_subscriptions" ("endpoint")
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS "push_subscriptions_user_id_idx"
    ON "push_subscriptions" ("user_id")
  `)

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'push_subscriptions_user_id_users_id_fk'
      ) THEN
        ALTER TABLE "push_subscriptions"
          ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk"
          FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
      END IF;
    END $$;
  `)
}

