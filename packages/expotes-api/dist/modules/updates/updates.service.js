var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
import { Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';
import { manifestsTable } from '@expotes/db/schema';
import { v7 as uuidv7 } from 'uuid';
import { DatabaseService, } from "../../processors/database/database.service";
import { ManifestService } from '../manifest/manifest.service';
import { AssetsService } from '../assets/assets.service';
import { StorageService } from './storage.services';
import { eq } from 'drizzle-orm';
let UpdatesService = class UpdatesService {
    constructor(db, storageService, manifestService, assetsService) {
        this.db = db;
        this.storageService = storageService;
        this.manifestService = manifestService;
        this.assetsService = assetsService;
        this.s3Client = new S3Client({
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
            id: assetId ?? uuidv7(),
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
        const manifestId = uuidv7();
        const extractPath = `tmp/extracted/${manifestId}/`;
        if (!fs.existsSync(extractPath)) {
            fs.mkdirSync(extractPath, { recursive: true });
        }
        const zip = new AdmZip(file.buffer);
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
                await tx.insert(manifestsTable).values({
                    id: manifestId,
                    appId,
                    runtimeVersion: meta.runtimeVersion,
                    createdAt: new Date(),
                    extra: {
                        expoClient: expoConfig,
                    },
                });
                const iosLaunchAssetId = fileMetadata.ios ? uuidv7() : null;
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
                        localPath: path.join(extractFolder, asset.path),
                    }, tx)));
                }
                const androidLaunchAssetId = fileMetadata.android ? uuidv7() : null;
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
                    .update(manifestsTable)
                    .set({
                    iosLaunchAssetId,
                    androidLaunchAssetId,
                    createdAt: new Date(),
                })
                    .where(eq(manifestsTable.id, manifestId))
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
UpdatesService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof DatabaseService !== "undefined" && DatabaseService) === "function" ? _a : Object, typeof (_b = typeof StorageService !== "undefined" && StorageService) === "function" ? _b : Object, typeof (_c = typeof ManifestService !== "undefined" && ManifestService) === "function" ? _c : Object, typeof (_d = typeof AssetsService !== "undefined" && AssetsService) === "function" ? _d : Object])
], UpdatesService);
export { UpdatesService };
//# sourceMappingURL=updates.service.js.map