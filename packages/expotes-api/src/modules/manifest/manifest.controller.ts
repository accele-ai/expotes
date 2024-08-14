import {
  Get,
  Param,
  ParseUUIDPipe,
  Res,
  UseInterceptors,
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ManifestService } from './manifest.service';
import {
  ExpoUpdatesV1,
  ExpoUpdatesV1Dto,
} from 'src/common/decorators/expo-updates-v1';
import { ApiController } from '@/common/decorators/api-controller.decorator';
import { Public } from '@/common/decorators/auth.decorator';
import { ExpoResponseHeaderInterceptor } from '@/common/interceptors/expo-response.interceptors';
import { ExpoSignatureInterceptor } from '@/common/interceptors/expo-signature.interceptors';
import { ApplicationService } from '../application/application.service';

interface IAppId {
  type: 'id' | 'handle';
  value: string;
}

@Injectable()
class AppIdPipe implements PipeTransform<string, IAppId> {
  transform(value: string, metadata: ArgumentMetadata) {
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      )
    ) {
      return { type: 'id', value } as const;
    }
    if (/^[a-zA-Z0-9-_]{1,15}$/.test(value)) {
      return { type: 'handle', value } as const;
    }
    throw new BadRequestException('Invalid appId format');
  }
}

@Public()
@ApiController('manifest')
export class ManifestController {
  constructor(
    private readonly manifestService: ManifestService,
    private readonly applicationService: ApplicationService,
  ) {}

  @Get('/:appId')
  @UseInterceptors(ExpoSignatureInterceptor)
  async manifest(
    @Param('appId', AppIdPipe) _appId: IAppId,
    @ExpoUpdatesV1() meta: ExpoUpdatesV1Dto,
  ) {
    const appId =
      _appId.type === 'id'
        ? _appId.value
        : (await this.applicationService.findOneByHandle(_appId.value)).id;
    return { manifest: await this.manifestService.endpoint(meta, appId) };
  }
}
