var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import fs from 'fs/promises';
import * as Minio from 'minio';
const DEFAULT_BUCKET = 'expotes';
let StorageService = class StorageService {
    constructor() {
        this.minio = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT || 'localhost',
            port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT) : 9000,
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: 'minioadmin',
            secretKey: 'minioadmin',
        });
    }
    async checkBucket(bucket) {
        const exists = await this.minio.bucketExists(bucket);
        if (!exists) {
            await this.minio.makeBucket(bucket);
        }
    }
    async upload({ key, data, bucket, extras }) {
        try {
            await this.minio.putObject(bucket ?? DEFAULT_BUCKET, key, data, undefined, extras);
        }
        catch (error) {
            await this.checkBucket(bucket);
            throw new ServiceUnavailableException(error);
        }
    }
    async uploadLocalFile({ path, ...props }) {
        const data = await fs.readFile(path);
        await this.upload({ data, ...props });
    }
};
StorageService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], StorageService);
export { StorageService };
//# sourceMappingURL=storage.services.js.map