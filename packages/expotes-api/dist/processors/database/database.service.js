"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const postgres_js_1 = require("drizzle-orm/postgres-js");
const migrator_1 = require("drizzle-orm/postgres-js/migrator");
const postgres_1 = __importDefault(require("postgres"));
const schema = __importStar(require("@expotes/db/schema"));
const Drizzle = postgres_js_1.drizzle;
class DatabaseService extends Drizzle {
    constructor() {
        const dbUrl = process.env.DATABASE_URL;
        const queryClient = (0, postgres_1.default)(dbUrl);
        super(queryClient, { schema });
        this.dbUrl = dbUrl;
        this.queryClient = queryClient;
        Object.setPrototypeOf(Object.getPrototypeOf(this), Drizzle.prototype);
    }
    async onModuleInit() {
        const migrationClient = (0, postgres_1.default)(this.dbUrl, {
            max: 1,
        });
        await (0, migrator_1.migrate)((0, postgres_js_1.drizzle)(migrationClient, { schema, logger: true }), {
            migrationsFolder: './drizzle',
            migrationsSchema: 'public',
        });
        await migrationClient.end();
    }
    async onModuleDestroy() {
        await this.queryClient.end();
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database.service.js.map