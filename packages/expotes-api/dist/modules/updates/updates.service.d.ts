import { DatabaseService } from 'src/processors/database/database.service';
import { ManifestService } from '../manifest/manifest.service';
import { AssetsService } from '../assets/assets.service';
import { StorageService } from './storage.services';
export declare class UpdatesService {
    private readonly db;
    private readonly storageService;
    private readonly manifestService;
    private readonly assetsService;
    private s3Client;
    constructor(db: DatabaseService, storageService: StorageService, manifestService: ManifestService, assetsService: AssetsService);
    private createAssetS3Key;
    private createAsset;
    createUpdates({ appId, meta, }: {
        appId: string;
        meta: {
            runtimeVersion: string;
        };
    }, file: Express.Multer.File): Promise<any>;
}
