import { Global, Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { CacheModule } from '@/processors/cache/cache.module';

@Module({
  imports: [CacheModule],
  providers: [SessionService],
  exports: [SessionService],
})
@Global() // Make session module because AuthGuard will use it
export class SessionModule {}
