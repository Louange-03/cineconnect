ALTER TABLE "messages" ADD COLUMN "reply_to_id" uuid;
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_messages_id_fk" FOREIGN KEY ("reply_to_id") REFERENCES "messages"("id") ON DELETE SET NULL;
