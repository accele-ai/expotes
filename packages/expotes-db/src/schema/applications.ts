import { timestamp, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { manifestsTable } from "./mainfest";
import { or, relations } from "drizzle-orm";
import { teamsTable } from "./teams";

export interface Bundle {
  ios: string;
  android: string;
}

export const applicationsTable = pgTable("applications", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => teamsTable.id)
    .notNull(),
  name: varchar("name").notNull(),

  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
});

export const applicationsRelation = relations(
  applicationsTable,
  ({ one, many }) => ({
    organization: one(teamsTable, {
      fields: [applicationsTable.organizationId],
      references: [teamsTable.id],
    }),
    manifests: many(manifestsTable),
  })
);
