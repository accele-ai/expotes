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
import { manifestsTable } from '@expotes/db/schema';
import { Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DatabaseService, } from "../../processors/database/database.service";
import { DriectiveService } from './driective.service';
import { convertSHA256HashToUUID } from "../../shared/utils/crypto.util";
export class NoUpdateAvailableError extends Error {
}
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
            where: eq(manifestsTable.runtimeVersion, runtimeVersion),
            orderBy: desc(manifestsTable.createdAt),
        });
        if (!manifest) {
            throw new NoUpdateAvailableError();
        }
        return manifest;
    }
    async getFullManifest(manifestId) {
        this.db.query.manifestsTable.findFirst({
            where: eq(manifestsTable.id, manifestId),
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
        if (meta.currentUpdateId === convertSHA256HashToUUID(manifest.id) &&
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
        return await (tx ?? this.db).insert(manifestsTable).values(manifest);
    }
};
ManifestService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof DatabaseService !== "undefined" && DatabaseService) === "function" ? _a : Object, typeof (_b = typeof DriectiveService !== "undefined" && DriectiveService) === "function" ? _b : Object])
], ManifestService);
export { ManifestService };
//# sourceMappingURL=manifest.service.js.map