import * as schema from "@db/schema";
import type { OnModuleDestroy } from "@nestjs/common";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

type DrizzleFn = typeof drizzle<typeof schema>;

const Drizzle = drizzle as unknown as {
	new (...args: Parameters<DrizzleFn>): ReturnType<DrizzleFn>;
};

export type Database = InstanceType<typeof Drizzle>;

export class DatabaseService extends Drizzle implements OnModuleDestroy {
	// private readonly dbUrl: string;
	private queryClient: ReturnType<typeof postgres>;

	constructor(test = false) {
		const dbUrl = test
			? process.env.TEST_DATABASE_URL
			: process.env.DATABASE_URL;
		if (!dbUrl) {
			throw new Error("DATABASE_URL is not set");
		}

		const queryClient = postgres(dbUrl);
		super(queryClient, { schema });
		// this.dbUrl = dbUrl;
		this.queryClient = queryClient;

		Object.setPrototypeOf(Object.getPrototypeOf(this), Drizzle.prototype);
	}

	async onModuleDestroy() {
		await this.queryClient.end();
	}
}
