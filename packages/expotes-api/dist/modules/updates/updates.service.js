"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatesService = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const adm_zip_1 = __importDefault(require("adm-zip"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const schema_1 = require("@expotes/db/schema");
const uuid_1 = require("uuid");
const database_service_1 = require("../../processors/database/database.service");
const manifest_service_1 = require("../manifest/manifest.service");
const assets_service_1 = require("../assets/assets.service");
const storage_services_1 = require("./storage.services");
const drizzle_orm_1 = require("drizzle-orm");
let UpdatesService = class UpdatesService {
    constructor(db, storageService, manifestService, assetsService) {
        this.db = db;
        this.storageService = storageService;
        this.manifestService = manifestService;
        this.assetsService = assetsService;
        this.s3Client = new client_s3_1.S3Client({
            region: 'auto',
            endpoint: 'http://minio:9000',
            credentials: {
                accessKeyId: 'minio',
                secretAccessKey: 'minio',
            },
        });
    }
    createAssetS3Key(runtimeVersion, mainfestId, assetName) {
        return `${runtimeVersion}/${mainfestId}/${assetName}`;
    }
    async createAsset({ assetId, runtimeVersion, manifestId, contentType, fileExtension, fileName, localPath, }, tx) {
        const s3Path = this.createAssetS3Key(runtimeVersion, manifestId, fileName);
        await this.storageService.uploadLocalFile({
            key: s3Path,
            path: localPath,
        });
        await this.assetsService.createAsset({
            id: assetId ?? (0, uuid_1.v7)(),
            path: s3Path,
            manifestId,
            contentType,
            fileExtension,
        }, tx);
    }
    async createUpdates({ appId, meta, }, file) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        const manifestId = (0, uuid_1.v7)();
        const extractPath = `tmp/extracted/${manifestId}/`;
        if (!fs.existsSync(extractPath)) {
            fs.mkdirSync(extractPath, { recursive: true });
        }
        const zip = new adm_zip_1.default(file.buffer);
        await zip.extractAllToAsync(extractPath, true);
        const metadataPath = path.join(extractPath, 'metadata.json');
        if (!fs.existsSync(metadataPath)) {
            throw new Error('metadata.json not found in ZIP file');
        }
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        const expoConfigPath = path.join(extractPath, 'expoConfig.json');
        const expoConfig = fs.existsSync(metadataPath)
            ? JSON.parse(fs.readFileSync(expoConfigPath, 'utf8'))
            : undefined;
        try {
            const fileMetadata = metadata.fileMetadata;
            const manifest = await this.db.transaction(async (tx) => {
                await tx.insert(schema_1.manifestsTable).values({
                    id: manifestId,
                    appId,
                    runtimeVersion: meta.runtimeVersion,
                    createdAt: new Date(),
                    extra: {
                        expoClient: expoConfig,
                    },
                });
                const iosLaunchAssetId = fileMetadata.ios ? (0, uuid_1.v7)() : null;
                const iosBundlePath = fileMetadata.ios.bundle
                    ? path.join(extractPath, fileMetadata.ios.bundle)
                    : null;
                const assetsPromises = [];
                const mime = (await import('mime')).default;
                if (iosLaunchAssetId && iosBundlePath) {
                    assetsPromises.push(this.createAsset({
                        assetId: iosLaunchAssetId,
                        runtimeVersion: meta.runtimeVersion,
                        manifestId,
                        fileName: fileMetadata.ios.bundle,
                        localPath: iosBundlePath,
                        fileExtension: '.bundle',
                        contentType: 'application/javascript',
                    }, tx));
                    assetsPromises.push(...fileMetadata.ios.assets.map((asset) => this.createAsset({
                        manifestId,
                        runtimeVersion: meta.runtimeVersion,
                        contentType: mime.getType(asset.ext),
                        fileExtension: `.${asset.ext}`,
                        fileName: asset.path,
                        localPath: path.join(extractPath, asset.path),
                    }, tx)));
                }
                const androidLaunchAssetId = fileMetadata.android ? (0, uuid_1.v7)() : null;
                const androidBundlePath = fileMetadata.android.bundle
                    ? path.join(extractPath, fileMetadata.android.bundle)
                    : null;
                if (androidLaunchAssetId && androidBundlePath) {
                    assetsPromises.push(this.createAsset({
                        assetId: androidLaunchAssetId,
                        runtimeVersion: meta.runtimeVersion,
                        manifestId,
                        fileName: fileMetadata.android.bundle,
                        localPath: androidBundlePath,
                        fileExtension: '.bundle',
                        contentType: 'application/javascript',
                    }, tx));
                }
                await Promise.all(assetsPromises);
                return await tx
                    .update(schema_1.manifestsTable)
                    .set({
                    iosLaunchAssetId,
                    androidLaunchAssetId,
                    createdAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.manifestsTable.id, manifestId))
                    .returning();
            });
            fs.unlinkSync(extractPath);
            return manifest;
        }
        catch (e) {
            console.log(e);
        }
    }
};
exports.UpdatesService = UpdatesService;
exports.UpdatesService = UpdatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        storage_services_1.StorageService,
        manifest_service_1.ManifestService,
        assets_service_1.AssetsService])
], UpdatesService);
//# sourceMappingURL=updates.service.js.map