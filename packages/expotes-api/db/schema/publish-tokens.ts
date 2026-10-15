import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { applicationsTable } from "./applications";

export const publishTokensTable = pgTable("publish_tokens", {
	id: uuid("id").primaryKey(),
	tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
	appId: uuid("app_id")
		.notNull()
		.references(() => applicationsTable.id, { onDelete: "cascade" }),
	channel: varchar("channel", { enum: ["preview", "production"] }).notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});
