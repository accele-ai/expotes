"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsService = void 0;
const schema_1 = require("@expotes/db/schema");
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_service_1 = require("../../processors/database/database.service");
const manifest_service_1 = require("../manifest/manifest.service");
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
            where: (0, drizzle_orm_1.eq)(schema_1.assetsTable.id, assetId),
        });
        if (!asset) {
            return new common_1.NotFoundException('Asset not found');
        }
        return asset;
    }
    async getAssetResponse(assetId) {
        const asset = await this.db.query.assetsTable.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.assetsTable.id, assetId),
            columns: {
                id: true,
                contentType: true,
                fileExtension: true,
            },
        });
        return asset;
    }
    async createAsset(asset, tx) {
        return await (tx ?? this.db).insert(schema_1.assetsTable).values(asset);
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        manifest_service_1.ManifestService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map