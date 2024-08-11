import {
  Controller,
  Get,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { ApiController } from '@/common/decorators/api-controller.decorator';
import {
  ExpoUpdatesV1,
  ExpoUpdatesV1Dto,
} from '@/common/decorators/expo-updates-v1';

@ApiController('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get(':assetId')
  @UsePipes(new ValidationPipe({ transform: true }))
  getAssets(
    @Param('assetId') assetId: string,
    @ExpoUpdatesV1() meta: ExpoUpdatesV1Dto,
  ) {
    // return this.assetsService.getAsset(meta, assetId);
  }
}
