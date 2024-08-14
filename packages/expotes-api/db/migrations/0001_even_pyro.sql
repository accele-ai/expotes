CREATE TABLE IF NOT EXISTS "domains" (
	"id" uuid PRIMARY KEY NOT NULL,
	"application_id" uuid NOT NULL,
	"domain" varchar NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "domains_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "name" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "handle" SET DATA TYPE varchar(15);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "applications" ADD COLUMN "handle" varchar(15);
  UPDATE "applications" SET "handle" = SUBSTRING(lower(name), 1, 15) WHERE "handle" IS NULL;
  ALTER TABLE "applications" ALTER COLUMN "handle" SET NOT NULL;
END $$;
DO $$ BEGIN
 ALTER TABLE "domains" ADD CONSTRAINT "domains_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "application_handle_idx" ON "applications" USING btree (lower("handle"));--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "teams_handle_idx" ON "teams" USING btree (lower("handle"));