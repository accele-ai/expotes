var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
import { assetsTable } from '@expotes/db/schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService, } from "../../processors/database/database.service";
import { ManifestService } from '../manifest/manifest.service';
let AssetsService = class AssetsService {
    constructor(db, manifestService) {
        this.db = db;
        this.manifestService = manifestService;
    }
    async getLatestBundlePath(runtimeVersion, assetName) {
        const manifests = this.manifestService.getLatestManifest(runtimeVersion);
        if (!manifests) {
            throw new Error('Unsupported runtime version');
        }
    }
    async getAsset(assetId) {
        const asset = await this.db.query.assetsTable.findFirst({
            where: eq(assetsTable.id, assetId),
        });
        if (!asset) {
            return new NotFoundException('Asset not found');
        }
        return asset;
    }
    async getAssetResponse(assetId) {
        const asset = await this.db.query.assetsTable.findFirst({
            where: eq(assetsTable.id, assetId),
            columns: {
                id: true,
                contentType: true,
                fileExtension: true,
            },
        });
        return asset;
    }
    async createAsset(asset, tx) {
        return await (tx ?? this.db).insert(assetsTable).values(asset);
    }
};
AssetsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof DatabaseService !== "undefined" && DatabaseService) === "function" ? _a : Object, typeof (_b = typeof ManifestService !== "undefined" && ManifestService) === "function" ? _b : Object])
], AssetsService);
export { AssetsService };
//# sourceMappingURL=assets.service.js.map