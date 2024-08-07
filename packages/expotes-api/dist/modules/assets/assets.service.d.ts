import { assetsTable } from '@expotes/db/schema';
import { NotFoundException } from '@nestjs/common';
import { Database, DatabaseService } from 'src/processors/database/database.service';
import { ManifestService } from '../manifest/manifest.service';
type InsertAsset = typeof assetsTable.$inferInsert;
export declare class AssetsService {
    private readonly db;
    private readonly manifestService;
    constructor(db: DatabaseService, manifestService: ManifestService);
    getLatestBundlePath(runtimeVersion: number, assetName: string): Promise<void>;
    getAsset(assetId: string): Promise<{
        id: string;
        manifestId: string;
        path: string;
        contentType: string;
        hash: string;
        fileExtension: string;
    } | NotFoundException>;
    getAssetResponse(assetId: string): Promise<{
        id: string;
        contentType: string;
        fileExtension: string;
    }>;
    createAsset(asset: InsertAsset, tx?: Database): Promise<import("postgres").RowList<never[]>>;
}
export {};
