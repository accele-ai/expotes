"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersToTeamsRelation = exports.usersToTeams = exports.roleEnum = exports.usersTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const teams_1 = require("./teams");
const drizzle_orm_1 = require("drizzle-orm");
exports.usersTable = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").primaryKey(),
    email: (0, pg_core_1.varchar)("email").notNull(),
    password: (0, pg_core_1.varchar)("password").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: "date" }).notNull().defaultNow(),
});
exports.roleEnum = (0, pg_core_1.pgEnum)("role", ["admin", "user"]);
exports.usersToTeams = (0, pg_core_1.pgTable)("users_to_teams", {
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => exports.usersTable.id)
        .notNull(),
    teamId: (0, pg_core_1.uuid)("team_id")
        .references(() => teams_1.teamsTable.id)
        .notNull(),
    role: (0, exports.roleEnum)("role").notNull().default("user"),
    isSuspened: (0, pg_core_1.boolean)("is_suspened"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: "date" }).notNull().defaultNow(),
}, (t) => {
    return {
        pk: (0, pg_core_1.primaryKey)({ columns: [t.userId, t.teamId] }),
    };
});
exports.usersToTeamsRelation = (0, drizzle_orm_1.relations)(exports.usersToTeams, ({ one }) => ({
    user: one(exports.usersTable, {
        fields: [exports.usersToTeams.userId],
        references: [exports.usersTable.id],
    }),
    team: one(teams_1.teamsTable, {
        fields: [exports.usersToTeams.teamId],
        references: [teams_1.teamsTable.id],
    }),
}));
// export const sessionsTable = pgTable("sessions", {
// 	id: text("id").primaryKey(),
// 	userId: uuid("user_id")
// 		.notNull()
// 		.references(() => usersTable.id),
// 	expiresAt: timestamp("expires_at", {
// 		withTimezone: true,
// 		mode: "date"
// 	}).notNull()
// });
//# sourceMappingURL=user.js.map