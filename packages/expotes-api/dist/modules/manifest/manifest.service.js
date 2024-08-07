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
exports.ManifestService = exports.NoUpdateAvailableError = void 0;
const schema_1 = require("@expotes/db/schema");
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_service_1 = require("../../processors/database/database.service");
const driective_service_1 = require("./driective.service");
const crypto_util_1 = require("../../shared/utils/crypto.util");
class NoUpdateAvailableError extends Error {
}
exports.NoUpdateAvailableError = NoUpdateAvailableError;
let ManifestService = class ManifestService {
    constructor(db, directiveService) {
        this.db = db;
        this.directiveService = directiveService;
    }
    async endpoint(meta) {
        const manifest = await this.getLatestManifest(meta.runtimeVersion);
        if (manifest.isRollbacked) {
            return this.rollback(meta, manifest);
        }
        return;
    }
    async getLatestManifest(runtimeVersion) {
        const manifest = await this.db.query.manifestsTable.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.manifestsTable.runtimeVersion, runtimeVersion.toString()),
            orderBy: (0, drizzle_orm_1.desc)(schema_1.manifestsTable.createdAt),
        });
        if (!manifest) {
            throw new NoUpdateAvailableError();
        }
        return manifest;
    }
    async getFullManifest(manifestId) {
        this.db.query.manifestsTable.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.manifestsTable.id, manifestId),
            columns: {
                id: true,
                createdAt: true,
                runtimeVersion: true,
                metadata: true,
                extra: true,
            },
            with: {
                assets: {
                    columns: {
                        hash: true,
                        contentType: true,
                        fileExtension: true,
                        path: true,
                    },
                },
            },
        });
    }
    async update(meta, manifest) {
        if (meta.currentUpdateId === (0, crypto_util_1.convertSHA256HashToUUID)(manifest.id) &&
            meta.protocolVersion === 1) {
            throw new NoUpdateAvailableError();
        }
    }
    async rollback(meta, manifest) {
        if (meta.protocolVersion === 0) {
            throw new Error('Rollbacks not supported on protocol version 0');
        }
        if (!meta.embeddedUpdateId) {
            throw new Error('Invalid Expo-Embedded-Update-ID request header specified.');
        }
        if (meta.currentUpdateId === meta.embeddedUpdateId) {
            throw new NoUpdateAvailableError();
        }
        if (!manifest.rollbackedAt) {
            throw new Error('RollbackedAt not found');
        }
        return this.directiveService.RollBack(manifest.rollbackedAt.toISOString());
    }
    async noUpdate() {
        return await this.directiveService.NoUpdateAvailable();
    }
    async createManifest(manifest, tx) {
        return await (tx ?? this.db).insert(schema_1.manifestsTable).values(manifest);
    }
};
exports.ManifestService = ManifestService;
exports.ManifestService = ManifestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        driective_service_1.DriectiveService])
], ManifestService);
//# sourceMappingURL=manifest.service.js.map