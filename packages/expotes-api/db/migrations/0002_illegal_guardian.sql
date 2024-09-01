CREATE TABLE IF NOT EXISTS "cdn_provider" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" uuid NOT NULL,
	"type" varchar NOT NULL,
	"name" varchar(32) NOT NULL,
	"protocol" varchar(16) DEFAULT 'https' NOT NULL,
	"host" varchar(256) NOT NULL,
	"origin" varchar(256) NOT NULL,
	"options" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cdn_provider_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "storage_provider" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" uuid NOT NULL,
	"type" varchar NOT NULL,
	"name" varchar(32) NOT NULL,
	"access_key" varchar(256) NOT NULL,
	"secret_key" varchar(256) NOT NULL,
	"endpoint" varchar(256) NOT NULL,
	"bucket" varchar(256) NOT NULL,
	"region" varchar(256) NOT NULL,
	"prefix" varchar(256) DEFAULT '' NOT NULL,
	"extras" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "storage_provider_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "manifests" ADD COLUMN "notes" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "manifests" ADD COLUMN "options" jsonb DEFAULT '{"storage":[]}'::jsonb NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cdn_provider" ADD CONSTRAINT "cdn_provider_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "storage_provider" ADD CONSTRAINT "storage_provider_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
