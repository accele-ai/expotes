import { Body, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UpdatesService } from './updates.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { CreateUpdatesDto } from './updates.dto';
import { ApiController } from '@/common/decorators/api-controller.decorator';

@ApiController('updates')
export class UpdatesController {
  constructor(private readonly uploadService: UpdatesService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() body: CreateUpdatesDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadService.createUpdates(
      {
        appId: body.appId,
        meta: { runtimeVersion: '1' },
      },
      file,
    );
  }
}
