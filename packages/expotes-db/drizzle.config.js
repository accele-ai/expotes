"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const drizzle_kit_1 = require("drizzle-kit");
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    throw 'DATABASE_URL is not set';
}
exports.default = (0, drizzle_kit_1.defineConfig)({
    dialect: 'postgresql',
    schema: './src/schema/**/*.ts',
    out: './migrations',
    dbCredentials: {
        url: dbUrl,
    },
    verbose: true,
    strict: true,
});
//# sourceMappingURL=drizzle.config.js.map