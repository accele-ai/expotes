CREATE TABLE IF NOT EXISTS "publish_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"app_id" uuid NOT NULL,
	"channel" varchar NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "publish_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "asset_key" varchar;--> statement-breakpoint
UPDATE "assets" SET "asset_key" = regexp_replace("path", '^.*/', '');--> statement-breakpoint
ALTER TABLE "assets" ALTER COLUMN "asset_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "platform" varchar;--> statement-breakpoint
ALTER TABLE "manifests" ADD COLUMN "channel" varchar DEFAULT 'production' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publish_tokens" ADD CONSTRAINT "publish_tokens_app_id_applications_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
