import { Cache } from "cache-manager";
import type { RedisCache } from "cache-manager-ioredis-yet";

import { RedisDelimiter } from "@/constants/cache.constant";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Redis } from "ioredis";

// 获取器
export type TCacheKey = string;
export type TCacheResult<T> = Promise<T | undefined>;

/**
 * @class CacheService
 * @classdesc 承载缓存服务
 * @example CacheService.get(CacheKey).then()
 * @example CacheService.set(CacheKey).then()
 */
@Injectable()
export class CacheService {
	public cache: RedisCache;
	private logger = new Logger(CacheService.name);

	constructor(@Inject(CACHE_MANAGER) cache: RedisCache) {
		this.cache = cache;
		this.redisClient.on("ready", () => {
			this.logger.log("Redis is ready!");
		});
	}

	public get redisClient() {
		return this.cache.store.client;
	}

	private getKey(key: TCacheKey): TCacheKey {
		return `cache:${key}`;
	}

	public get<T>(key: TCacheKey): TCacheResult<T> {
		// return this.cache.get(key);
		return this.cache.get(this.getKey(key));
	}

	public set(key: TCacheKey, value: unknown, ttl?: number | undefined) {
		// return this.cache.set(key, value, ttl || 0);
		return this.cache.set(this.getKey(key), value, ttl || 0);
	}

	public createCacheKey(...parts: (string | number)[]): string {
		return parts.join(RedisDelimiter);
	}
}
