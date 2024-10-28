import { uuid } from "drizzle-orm/pg-core";
import {
	jsonb,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";
import { relations } from "drizzle-orm";

/* Object Storage Provider, must be S3 compatible */
export const storageProviderTable = pgTable("storage_provider", {
	id: serial("id").primaryKey(),
	teamId: uuid("team_id")
		.references(() => teamsTable.id)
		.notNull(),

	type: varchar("type", { enum: ["minio", "s3", "tencent-cos"] }).notNull(),
	name: varchar("name", { length: 32 }).notNull().unique(),

	accessKey: varchar("access_key", { length: 256 }).notNull(),
	secretKey: varchar("secret_key", { length: 256 }).notNull(),

	endpoint: varchar("endpoint", { length: 256 }).notNull(),
	bucket: varchar("bucket", { length: 256 }).notNull(),
	region: varchar("region", { length: 256 }).notNull(),
	prefix: varchar("prefix", { length: 256 }).default("").notNull(),

	extras: jsonb("extras").$type<Record<string, any>>().default({}).notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const storageProviderRelations = relations(
	storageProviderTable,
	({ one }) => ({
		team: one(teamsTable, {
			fields: [storageProviderTable.teamId],
			references: [teamsTable.id],
		}),
	}),
);

export const cdnProviderTable = pgTable("cdn_provider", {
	id: serial("id").primaryKey(),
	teamId: uuid("team_id")
		.references(() => teamsTable.id)
		.notNull(),

	type: varchar("type", {
		enum: ["cloudflare", "aws-cloudfront", "tencent-cdn"],
	}).notNull(),
	name: varchar("name", { length: 32 }).notNull().unique(),

	protocol: varchar("protocol", {
		length: 16,
		enum: ["http", "https"],
	})
		.default("https")
		.notNull(),
	host: varchar("host", { length: 256 }).notNull(),
	origin: varchar("origin", { length: 256 }).notNull(),

	options: jsonb("options").$type<Record<string, any>>().default({}).notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cdnProviderRelations = relations(cdnProviderTable, ({ one }) => ({
	team: one(teamsTable, {
		fields: [cdnProviderTable.teamId],
		references: [teamsTable.id],
	}),
}));

export type IStorageProviderSelect = typeof storageProviderTable.$inferSelect;
export type IStorageProviderInsert = typeof storageProviderTable.$inferInsert;
export type ICDNProviderSelect = typeof cdnProviderTable.$inferSelect;
export type ICDNProviderInsert = typeof cdnProviderTable.$inferInsert;
