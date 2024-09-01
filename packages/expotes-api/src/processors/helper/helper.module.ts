import { Module } from '@nestjs/common';
import { StorageService } from './storage/storage.services';
import { CDNService } from './cdn/cdn.service';

@Module({
  providers: [StorageService, CDNService],
  exports: [StorageService, CDNService],
})
export class HelperModule {}
