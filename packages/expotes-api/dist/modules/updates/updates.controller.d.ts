import { UpdatesService } from './updates.service';
export declare class UpdatesController {
    private readonly uploadService;
    constructor(uploadService: UpdatesService);
    uploadFile(file: Express.Multer.File): Promise<{
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
    }[]>;
}
