import { Get } from '@nestjs/common';
import { ManifestService } from './manifest.service';
import {
  ExpoUpdatesV1,
  ExpoUpdatesV1Dto,
} from 'src/common/decorators/expo-updates-v1';
import { ApiController } from '@/common/decorators/api-controller.decorator';

@ApiController('manifest')
export class ManifestController {
  constructor(private readonly manifestService: ManifestService) {}

  @Get()
  manifest(@ExpoUpdatesV1() meta: ExpoUpdatesV1Dto) {
    return this.manifestService.endpoint(meta);
  }
}
