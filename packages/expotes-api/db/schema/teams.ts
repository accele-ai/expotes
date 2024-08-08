import { relations } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { usersTable } from './user';
import { applicationsTable } from './applications';

export const teamsTable = pgTable('teams', {
  id: uuid('id').primaryKey(),
  handle: varchar('name', { length: 32 }).notNull(),

  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

export const teamsRelation = relations(teamsTable, ({ many }) => ({
  applications: many(applicationsTable),
  users: many(usersTable),
}));
