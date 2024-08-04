"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationsRelation = exports.applicationsTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const mainfest_1 = require("./mainfest");
const drizzle_orm_1 = require("drizzle-orm");
const organization_1 = require("./organization");
exports.applicationsTable = (0, pg_core_1.pgTable)("applications", {
    id: (0, pg_core_1.uuid)("id").primaryKey(),
    organizationId: (0, pg_core_1.uuid)("organization_id")
        .references(() => organization_1.organizationesTable.id)
        .notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: "date" }).notNull(),
});
exports.applicationsRelation = (0, drizzle_orm_1.relations)(exports.applicationsTable, ({ one, many }) => ({
    organization: one(organization_1.organizationesTable, {
        fields: [exports.applicationsTable.organizationId],
        references: [organization_1.organizationesTable.id],
    }),
    manifests: many(mainfest_1.manifestsTable),
}));
//# sourceMappingURL=applications.js.map