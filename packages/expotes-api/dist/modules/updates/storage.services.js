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
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = __importDefault(require("fs/promises"));
const Minio = __importStar(require("minio"));
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
            throw new common_1.ServiceUnavailableException(error);
        }
    }
    async uploadLocalFile({ path, ...props }) {
        const data = await promises_1.default.readFile(path);
        await this.upload({ data, ...props });
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], StorageService);
//# sourceMappingURL=storage.services.js.map