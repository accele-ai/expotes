import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '@expotes/db/schema';
const Drizzle = drizzle;
export class DatabaseService extends Drizzle {
    constructor() {
        const dbUrl = process.env.DATABASE_URL;
        const queryClient = postgres(dbUrl);
        super(queryClient, { schema });
        this.dbUrl = dbUrl;
        this.queryClient = queryClient;
    }
    async onModuleInit() {
        const migrationClient = postgres(this.dbUrl, {
            max: 1,
        });
        await migrate(drizzle(migrationClient, { schema, logger: true }), {
            migrationsFolder: './drizzle',
            migrationsSchema: 'public',
        });
        await migrationClient.end();
    }
    async onModuleDestroy() {
        await this.queryClient.end();
    }
}
//# sourceMappingURL=database.service.js.map