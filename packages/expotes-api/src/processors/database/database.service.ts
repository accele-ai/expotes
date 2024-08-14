import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { OnModuleDestroy } from '@nestjs/common';
import * as schema from '@db/schema';

type DrizzleFn = typeof drizzle<typeof schema>;

const Drizzle = drizzle as unknown as {
  new (...args: Parameters<DrizzleFn>): ReturnType<DrizzleFn>;
};

export type Database = InstanceType<typeof Drizzle>;

export class DatabaseService extends Drizzle implements OnModuleDestroy {
  private readonly dbUrl: string;
  private queryClient: ReturnType<typeof postgres>;

  constructor() {
    const dbUrl = process.env.DATABASE_URL!;
    const queryClient = postgres(dbUrl);
    super(queryClient, { schema });
    this.dbUrl = dbUrl;
    this.queryClient = queryClient;

    Object.setPrototypeOf(Object.getPrototypeOf(this), Drizzle.prototype);
  }

  async onModuleDestroy() {
    await this.queryClient.end();
  }
}
