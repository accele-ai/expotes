import { CacheService } from "@/processors/cache/cache.service";
import { DatabaseService } from "@/processors/database/database.service";
import { IStorageProviderSelect, storageProviderTable } from "@db/schema";
import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { assert } from "typia";
import { AbstractObjectStorage } from "./abstract.storage";
import { S3Storage, S3StorageProps, readDefaultS3Config } from "./s3.storage";
import { TencentCosStorage } from "./tencent.storage";

@Injectable()
export class StorageService {
	private readonly default: AbstractObjectStorage = new S3Storage(
		readDefaultS3Config(),
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
			case "s3":
			case "minio":
				return new S3Storage(
					assert<S3StorageProps>({
						bucket: storageProvider.bucket,
						accessKey: storageProvider.accessKey,
						secretKey: storageProvider.secretKey,
						endpoint: storageProvider.endpoint,
						region: storageProvider.region,
						// prefix: storageProvider.prefix,
						port: storageProvider.extras.port,
						useSSL: storageProvider.extras.useSSL,
					}),
				);
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
