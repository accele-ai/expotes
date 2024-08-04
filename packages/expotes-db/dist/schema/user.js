"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionsTable = exports.usersToOrganization = exports.roleEnum = exports.usersTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const organization_1 = require("./organization");
exports.usersTable = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").primaryKey(),
    email: (0, pg_core_1.varchar)("email").notNull(),
    password: (0, pg_core_1.varchar)("password").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: "date" }).notNull().defaultNow(),
});
exports.roleEnum = (0, pg_core_1.pgEnum)("role", ["admin", "user"]);
exports.usersToOrganization = (0, pg_core_1.pgTable)("users_to_organizationes", {
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => exports.usersTable.id)
        .notNull(),
    organizationId: (0, pg_core_1.uuid)("organization_id")
        .references(() => organization_1.organizationesTable.id)
        .notNull(),
    role: (0, exports.roleEnum)("role").notNull().default("user"),
    isSuspened: (0, pg_core_1.boolean)("is_suspened"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: "date" }).notNull().defaultNow(),
}, (t) => {
    return {
        pk: (0, pg_core_1.primaryKey)({ columns: [t.userId, t.organizationId] }),
    };
});
exports.sessionsTable = (0, pg_core_1.pgTable)("sessions", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .notNull()
        .references(() => exports.usersTable.id),
    expiresAt: (0, pg_core_1.timestamp)("expires_at", {
        withTimezone: true,
        mode: "date"
    }).notNull()
});
//# sourceMappingURL=user.js.map