import { Module } from '@nestjs/common';
import { ManifestService } from './manifest.service';
import { ManifestController } from './manifest.controller';
import { DriectiveService } from './driective.service';
import { HelperModule } from '@/processors/helper/helper.module';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [HelperModule, ApplicationModule],
  controllers: [ManifestController],
  providers: [ManifestService, DriectiveService],
  exports: [ManifestService],
})
export class ManifestModule {}
