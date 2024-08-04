import { assetsTable } from '@expotes/db/schema';
import { Database, DatabaseService } from 'src/processors/database/database.service';
import { ManifestService } from '../manifest/manifest.service';
type InsertAsset = typeof assetsTable.$inferInsert;
export declare class AssetsService {
    private readonly db;
    private readonly manifestService;
    constructor(db: DatabaseService, manifestService: ManifestService);
    getLatestBundlePath(runtimeVersion: number, assetName: string): Promise<void>;
    getAsset(assetId: string): Promise<any>;
    getAssetResponse(assetId: string): Promise<any>;
    createAsset(asset: InsertAsset, tx?: Database): Promise<any>;
}
export {};