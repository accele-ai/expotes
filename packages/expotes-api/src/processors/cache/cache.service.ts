import { Cache } from 'cache-manager';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

export const RedisDelimiter = ':';
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
  public cache!: Cache;
  private logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) cache: Cache) {
    this.cache = cache;
    this.redisClient.on('ready', () => {
      this.logger.log('Redis is ready!');
    });
  }

  public get redisClient() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return this.cache.store.client as Redis;
  }

  private getKey(key: TCacheKey): TCacheKey {
    return `cache:${key}`;
  }

  public createKey(...parts: (string | number)[]): string {
    return parts.join(RedisDelimiter);
  }

  public get<T>(key: TCacheKey): TCacheResult<T> {
    return this.cache.get(this.getKey(key));
  }

  public set(key: TCacheKey, value: any, ttl?: number | undefined) {
    return this.cache.set(this.getKey(key), value, ttl || 0);
  }
}
