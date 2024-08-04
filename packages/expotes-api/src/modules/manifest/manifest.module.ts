import { Module } from '@nestjs/common';
import { ManifestService } from './manifest.service';
import { ManifestController } from './manifest.controller';
import { DriectiveService } from './driective.service';

@Module({
  controllers: [ManifestController],
  providers: [ManifestService, DriectiveService],
  exports: [ManifestService],
})
export class ManifestModule {}
