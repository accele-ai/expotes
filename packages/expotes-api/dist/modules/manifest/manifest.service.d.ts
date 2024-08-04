import { manifestsTable } from '@expotes/db/schema';
import { Database, DatabaseService } from 'src/processors/database/database.service';
import { DriectiveService } from './driective.service';
import { ExpoUpdatesV1Dto } from 'src/common/decorators/expo-updates-v1';
export declare class NoUpdateAvailableError extends Error {
}
type InsertManifest = typeof manifestsTable.$inferInsert;
export declare class ManifestService {
    private readonly db;
    private readonly directiveService;
    constructor(db: DatabaseService, directiveService: DriectiveService);
    endpoint(meta: ExpoUpdatesV1Dto): Promise<any>;
    getLatestManifest(runtimeVersion: number): Promise<any>;
    getFullManifest(manifestId: string): Promise<void>;
    update(meta: ExpoUpdatesV1Dto, manifest: any): Promise<void>;
    rollback(meta: ExpoUpdatesV1Dto, manifest: any): Promise<any>;
    noUpdate(): Promise<any>;
    createManifest(manifest: InsertManifest, tx?: Database): Promise<any>;
}
export {};
