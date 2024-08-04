import { Module } from '@nestjs/common';
import { UpdatesService } from './updates.service';
import { UpdatesController as UpdatesController } from './updates.controller';
import { StorageService } from './storage.services';
import { ManifestModule } from '../manifest/manifest.module';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [ManifestModule, AssetsModule],
  controllers: [UpdatesController],
  providers: [UpdatesService, StorageService],
  exports: [StorageService],
})
export class UpdatesModule {}
