import { Get, Res, UseInterceptors } from '@nestjs/common';
import { ManifestService } from './manifest.service';
import {
  ExpoUpdatesV1,
  ExpoUpdatesV1Dto,
} from 'src/common/decorators/expo-updates-v1';
import { ApiController } from '@/common/decorators/api-controller.decorator';
import { Public } from '@/common/decorators/auth.decorator';
import { ExpoResponseHeaderInterceptor } from '@/common/interceptors/expo-response.interceptors';
import { ExpoSignatureInterceptor } from '@/common/interceptors/expo-signature.interceptors';

@Public()
@ApiController('manifest')
export class ManifestController {
  constructor(private readonly manifestService: ManifestService) {}

  @Get()
  @UseInterceptors(ExpoSignatureInterceptor)
  async manifest(@ExpoUpdatesV1() meta: ExpoUpdatesV1Dto) {
    return { manifest: await this.manifestService.endpoint(meta) };
  }
}
