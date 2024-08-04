"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manifestsRelation = exports.manifestsTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const applications_1 = require("./applications");
const drizzle_orm_1 = require("drizzle-orm");
const assets_1 = require("./assets");
exports.manifestsTable = (0, pg_core_1.pgTable)("manifests", {
    /* The ID MUST uniquely specify the manifest and MUST be a UUID. */
    id: (0, pg_core_1.uuid)("id").primaryKey(),
    appId: (0, pg_core_1.uuid)("app_id")
        .references(() => applications_1.applicationsTable.id)
        .notNull(),
    isRollbacked: (0, pg_core_1.boolean)("is_rollback").notNull().default(false),
    rollbackedAt: (0, pg_core_1.timestamp)("rollbacked_at"),
    /* Can be any string defined by the developer.
    It stipulates what native code setup is required to run the associated update. */
    runtimeVersion: (0, pg_core_1.varchar)("runtime_version").notNull(),
    /* Id of a special asset that is the entry point of the application code.
    The fileExtension field will be ignored for this asset and SHOULD be omitted. */
    iosLaunchAssetId: (0, pg_core_1.uuid)("ios_launch_asset_id").references(() => assets_1.assetsTable.id),
    // .notNull(),
    androidLaunchAssetId: (0, pg_core_1.uuid)("android_launch_asset_id").references(() => assets_1.assetsTable.id),
    // .notNull(),
    /* The metadata associated with an update.
    It is a string-valued dictionary.
    The server MAY send back anything it wishes to be used for filtering the updates.
    The metadata MUST pass the filter defined in the accompanying expo-manifest-filters header. */
    metadata: (0, pg_core_1.jsonb)("metadata")
        .$type()
        .notNull()
        .default({}),
    /* For storage of optional "extra" information such as third-party configuration.
    For example, if the update is hosted on Expo Application Services (EAS), the EAS project ID may be included: */
    extra: (0, pg_core_1.jsonb)("extra").$type().notNull().default({}),
    /* The date and time at which the update was created is essential
      as the client library selects the most recent update (subject to any constraints supplied by the expo-manifest-filters header).
    The datetime should be formatted according to ISO 8601. */
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: "date" }).notNull(),
});
exports.manifestsRelation = (0, drizzle_orm_1.relations)(exports.manifestsTable, ({ one, many }) => ({
    application: one(applications_1.applicationsTable, {
        fields: [exports.manifestsTable.appId],
        references: [applications_1.applicationsTable.id],
    }),
    /* A special asset that is the entry point of the application code.  */
    iosLaunchAsset: one(assets_1.assetsTable, {
        fields: [exports.manifestsTable.iosLaunchAssetId],
        references: [assets_1.assetsTable.id],
    }),
    androidLaunchAsset: one(assets_1.assetsTable, {
        fields: [exports.manifestsTable.androidLaunchAssetId],
        references: [assets_1.assetsTable.id],
    }),
    /* A special asset that is the entry point of the application code.  */
    assets: many(assets_1.assetsTable),
}));
//# sourceMappingURL=mainfest.js.map