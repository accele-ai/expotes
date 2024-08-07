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
    endpoint(meta: ExpoUpdatesV1Dto): Promise<{
        type: string;
        parameters: {
            commitTime: string;
        };
    }>;
    getLatestManifest(runtimeVersion: number): Promise<{
        id: string;
        createdAt: Date;
        appId: string;
        isRollbacked: boolean;
        rollbackedAt: Date;
        runtimeVersion: string;
        iosLaunchAssetId: string;
        androidLaunchAssetId: string;
        metadata: {
            [key: string]: string;
        };
        extra: {
            [key: string]: any;
        };
    }>;
    getFullManifest(manifestId: string): Promise<void>;
    update(meta: ExpoUpdatesV1Dto, manifest: any): Promise<void>;
    rollback(meta: ExpoUpdatesV1Dto, manifest: any): Promise<{
        type: string;
        parameters: {
            commitTime: string;
        };
    }>;
    noUpdate(): Promise<{
        type: string;
    }>;
    createManifest(manifest: InsertManifest, tx?: Database): Promise<import("postgres").RowList<never[]>>;
}
export {};
