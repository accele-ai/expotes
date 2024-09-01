import {
  timestamp,
  pgTable,
  uuid,
  varchar,
  boolean,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { manifestsTable } from './mainfest';
import { relations, sql } from 'drizzle-orm';
import { teamsTable } from './teams';
import { jsonb } from 'drizzle-orm/pg-core';

export interface ApplicationOptions {
  /* Default Storage For Manifests */
  storage: {
    providerId: number;
    cdnIds: number[];
  }[];
}

export const applicationsTable = pgTable(
  'applications',
  {
    id: uuid('id').primaryKey(),
    teamId: uuid('team_id')
      .references(() => teamsTable.id)
      .notNull(),
    name: varchar('name').notNull(),
    handle: varchar('handle', { length: 15 }).notNull(),

    // options: jsonb('options').$type<ApplicationOptions>().notNull().default({
    //   storage: [],
    // }),

    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (t) => ({
    handleIdx: uniqueIndex('application_handle_idx').on(
      sql`lower(${t.handle})`,
    ),
  }),
);

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

export const domainsTable = pgTable('domains', {
  id: uuid('id').primaryKey(),
  applicationId: uuid('application_id')
    .references(() => applicationsTable.id, { onDelete: 'cascade' })
    .notNull(),
  domain: varchar('domain').notNull().unique(),
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

export const domainsRelation = relations(domainsTable, ({ one }) => ({
  application: one(applicationsTable, {
    fields: [domainsTable.applicationId],
    references: [applicationsTable.id],
  }),
}));
