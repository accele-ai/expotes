import {
  boolean,
  jsonb,
  pgTable,
  uuid,
  varchar,
  timestamp,
  AnyPgColumn,
  text,
} from 'drizzle-orm/pg-core';
import { applicationsTable } from './applications';
import { relations } from 'drizzle-orm';
import { assetsTable } from './assets';

export interface ManifestsOptions {
  storage: {
    providerId: number;
    cdnIds: number[];
  }[];
}

export const manifestsTable = pgTable('manifests', {
  /* The ID MUST uniquely specify the manifest and MUST be a UUID. */
  id: uuid('id').primaryKey(),
  appId: uuid('app_id')
    .references(() => applicationsTable.id)
    .notNull(),
  isRollbacked: boolean('is_rollback').notNull().default(false),
  rollbackedAt: timestamp('rollbacked_at'),
  /* Can be any string defined by the developer. 
  It stipulates what native code setup is required to run the associated update. */
  runtimeVersion: varchar('runtime_version').notNull(),
  /* Id of a special asset that is the entry point of the application code. 
  The fileExtension field will be ignored for this asset and SHOULD be omitted. */
  iosLaunchAssetId: uuid('ios_launch_asset_id').references(
    (): AnyPgColumn => assetsTable.id,
  ),
  // .notNull(),
  androidLaunchAssetId: uuid('android_launch_asset_id').references(
    (): AnyPgColumn => assetsTable.id,
  ),
  // .notNull(),
  /* The metadata associated with an update. 
  It is a string-valued dictionary.
  The server MAY send back anything it wishes to be used for filtering the updates. 
  The metadata MUST pass the filter defined in the accompanying expo-manifest-filters header. */
  metadata: jsonb('metadata')
    .$type<{ [key: string]: string }>()
    .notNull()
    .default({}),
  /* For storage of optional "extra" information such as third-party configuration. 
  For example, if the update is hosted on Expo Application Services (EAS), the EAS project ID may be included: */
  extra: jsonb('extra').$type<{ [key: string]: any }>().notNull().default({}),
  /* The date and time at which the update was created is essential 
    as the client library selects the most recent update (subject to any constraints supplied by the expo-manifest-filters header). 
  The datetime should be formatted according to ISO 8601. */
  createdAt: timestamp('created_at', { mode: 'date' }).notNull(),

  notes: text('notes').notNull().default(''),
  options: jsonb('options').$type<ManifestsOptions>().notNull().default({
    storage: [],
  }),
});

export const manifestsRelation = relations(manifestsTable, ({ one, many }) => ({
  application: one(applicationsTable, {
    fields: [manifestsTable.appId],
    references: [applicationsTable.id],
  }),
  /* A special asset that is the entry point of the application code.  */
  iosLaunchAsset: one(assetsTable, {
    fields: [manifestsTable.iosLaunchAssetId],
    references: [assetsTable.id],
  }),
  androidLaunchAsset: one(assetsTable, {
    fields: [manifestsTable.androidLaunchAssetId],
    references: [assetsTable.id],
  }),
  /* A special asset that is the entry point of the application code.  */
  assets: many(assetsTable),
}));
