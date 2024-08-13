import 'dotenv/config';

import { defineConfig } from 'drizzle-kit';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw 'DATABASE_URL is not set';
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema/**/*.ts',
  out: './db/migrations/',
  dbCredentials: {
    url: dbUrl,
  },
  verbose: true,
  strict: true,
});
