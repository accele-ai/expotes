import { timestamp, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { manifestsTable } from './mainfest';
import { relations } from 'drizzle-orm';
import { teamsTable } from './teams';

export interface Bundle {
  ios: string;
  android: string;
}

export const applicationsTable = pgTable('applications', {
  id: uuid('id').primaryKey(),
  teamId: uuid('team_id')
    .references(() => teamsTable.id)
    .notNull(),
  name: varchar('name').notNull(),
  DataHandler: varchar('name').notNull(),

  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

export const applicationsRelation = relations(
  applicationsTable,
  ({ one, many }) => ({
    team: one(teamsTable, {
      fields: [applicationsTable.teamId],
      references: [teamsTable.id],
    }),
    manifests: many(manifestsTable),
  }),
);
