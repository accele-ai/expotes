import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';

import { CacheConfigService } from './cache.config';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      useClass: CacheConfigService,
      inject: [CacheConfigService],
      isGlobal: true,
    }),
  ],
  providers: [CacheConfigService, CacheService],
  exports: [CacheService],
})
export class CacheModule {}
