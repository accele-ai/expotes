import { join } from "node:path";
import * as schema from "@db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

export const dbMigration = async () => {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) throw new Error("DATABASE_URL is not set");
	const migrationClient = postgres(databaseUrl, {
		max: 1,
	});

	try {
		await migrate(drizzle(migrationClient, { schema }), {
			migrationsFolder: join(process.cwd(), "./dist/db/migrations"),
		});
	} finally {
		await migrationClient.end();
	}
};
