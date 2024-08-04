"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationRelation = exports.organizationesTable = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const user_1 = require("./user");
const applications_1 = require("./applications");
exports.organizationesTable = (0, pg_core_1.pgTable)("organizationes", {
    id: (0, pg_core_1.uuid)("id").primaryKey(),
    handle: (0, pg_core_1.varchar)("name", { length: 32 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: "date" }).defaultNow(),
});
exports.organizationRelation = (0, drizzle_orm_1.relations)(exports.organizationesTable, ({ many }) => ({
    applications: many(applications_1.applicationsTable),
    users: many(user_1.usersTable),
}));
//# sourceMappingURL=organization.js.map