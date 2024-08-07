import { redisStore } from 'cache-manager-ioredis-yet';
import { RedisOptions } from 'ioredis';
import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parseRedisUrl } from 'parse-redis-url-simple';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private configService: ConfigService) {}

  // 缓存配置
  public createCacheOptions(): CacheModuleOptions {
    const redisOptions = parseRedisUrl(
      'redis://localhost:6379',
    )[0] satisfies RedisOptions;
    return {
      store: redisStore,
      ttl: 60 * 1000, // millisecond
      // https://github.com/dabroek/node-cache-manager-redis-store/blob/master/CHANGELOG.md#breaking-changes
      // Any value (undefined | null) return true (cacheable) after redisStore v2.0.0
      is_cacheable_value: () => true,
      lazyConnect: true,
      keepAlive: 1000,
      connectTimeout: 10000,
      ...redisOptions,
    };
  }
}
