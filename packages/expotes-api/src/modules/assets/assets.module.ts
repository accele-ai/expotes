import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { ManifestModule } from '../manifest/manifest.module';
import { StorageService } from '@/processors/helper/storage/storage.services';

@Module({
  imports: [ManifestModule],
  controllers: [AssetsController],
  providers: [AssetsService, StorageService],
  exports: [AssetsService],
})
export class AssetsModule {}
