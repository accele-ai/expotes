import { relations, sql } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { usersTable } from './user';
import { applicationsTable } from './applications';

export const teamsTable = pgTable(
  'teams',
  {
    id: uuid('id').primaryKey(),
    name: varchar('name').notNull(),
    handle: varchar('handle', { length: 15 }).notNull(),

    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  },
  (t) => ({
    handleIdx: uniqueIndex('teams_handle_idx').on(sql`lower(${t.handle})`),
  }),
);

export const teamsRelation = relations(teamsTable, ({ many }) => ({
  applications: many(applicationsTable),
  users: many(usersTable),
}));
