import postgres from 'postgres';
import * as schema from '@db/schema';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

export const dbMigration = async () => {
  const migrationClient = postgres(process.env.DATABASE_URL!, {
    max: 1,
  });

  await migrate(drizzle(migrationClient, { schema, logger: true }), {
    migrationsFolder: join(process.cwd(), './dist/db/migrations'),
  });
  await migrationClient.end();
};
