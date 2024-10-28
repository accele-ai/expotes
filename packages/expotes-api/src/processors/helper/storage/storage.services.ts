import { Injectable } from "@nestjs/common";
import { AbstractObjectStorage } from "./abstract.storage";
import { DEFAULT_MINIO_PROPS, MinioStorage } from "./minio.storage";
import { DatabaseService } from "@/processors/database/database.service";
import { IStorageProviderSelect, storageProviderTable } from "@db/schema";
import { eq } from "drizzle-orm";
import { TencentCosStorage } from "./tencent.storage";
import { CacheService } from "@/processors/cache/cache.service";

@Injectable()
export class StorageService {
	private default: AbstractObjectStorage = new MinioStorage(
		DEFAULT_MINIO_PROPS,
	);

	constructor(
		private readonly db: DatabaseService,
		private readonly cache: CacheService,
	) {}

	async fetchStorage(providerId: number): Promise<IStorageProviderSelect> {
		const cacheKey = `storage_provider:${providerId}`;
		const cachedProvider =
			await this.cache.get<IStorageProviderSelect>(cacheKey);

		if (cachedProvider) {
			return cachedProvider;
		}

		const storageProvider = await this.db.query.storageProviderTable.findFirst({
			where: eq(storageProviderTable.id, providerId),
		});

		if (!storageProvider) {
			throw new Error("Storage provider not found");
		}

		await this.cache.set(cacheKey, storageProvider, 3600); // Cache for 1 hour

		return storageProvider;
	}

	async getStorage(providerId?: number): Promise<AbstractObjectStorage> {
		if (!providerId) {
			return this.default;
		}

		const storageProvider = await this.fetchStorage(providerId);

		switch (storageProvider.type) {
			case "minio":
				return new MinioStorage({
					bucket: storageProvider.bucket,
					accessKey: storageProvider.accessKey,
					secretKey: storageProvider.secretKey,
					endpoint: storageProvider.endpoint,
					region: storageProvider.region,
					// prefix: storageProvider.prefix,
					port: storageProvider.extras.port,
					useSSL: storageProvider.extras.useSSL,
				});
			case "tencent-cos":
				return new TencentCosStorage({
					bucket: storageProvider.bucket,
					secretId: storageProvider.accessKey,
					secretKey: storageProvider.secretKey,
					region: storageProvider.region,
					// prefix: storageProvider.prefix,
				});
			default:
				throw new Error("Unsupported storage provider");
		}
	}
}
