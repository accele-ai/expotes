import { Global, Module } from '@nestjs/common';
import { JWEService } from './jwe.service';

@Module({
  providers: [JWEService],
  exports: [JWEService],
})
@Global()
export class HelperModule {}
