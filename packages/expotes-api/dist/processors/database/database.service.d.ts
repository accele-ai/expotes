import { drizzle } from 'drizzle-orm/postgres-js';
import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as schema from '@expotes/db/schema';
type DrizzleFn = typeof drizzle<typeof schema>;
declare const Drizzle: {
    new (...args: Parameters<DrizzleFn>): ReturnType<DrizzleFn>;
};
export type Database = InstanceType<typeof Drizzle>;
export declare class DatabaseService extends Drizzle implements OnModuleInit, OnModuleDestroy {
    private readonly dbUrl;
    private queryClient;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
export {};
