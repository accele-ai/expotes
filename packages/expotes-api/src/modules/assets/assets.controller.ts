import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsQueryDto } from './assets.dto';
import { ApiController } from '@/common/decorators/api-controller.decorator';

@ApiController('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  getAssets(@Query() query: AssetsQueryDto) {
    // return this.assetsService.getAssets();
  }
}
