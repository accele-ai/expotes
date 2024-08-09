import { Module } from '@nestjs/common';
import { StorageService } from './storage.services';

@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class HelperModule {}
