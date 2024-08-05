import { Global, Module } from '@nestjs/common';
import { SessionService } from './session.service';

@Module({
  providers: [SessionService],
  exports: [SessionService],
})
@Global() // Make session module because AuthGuard will use it
export class SessionModule {}
