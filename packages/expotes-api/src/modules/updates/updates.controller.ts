import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UpdatesService } from './updates.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('updates')
export class UpdatesController {
  constructor(private readonly uploadService: UpdatesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.createUpdates(
      {
        appId: '866eebb7-35fc-45b0-b31e-b94a470a2580',
        meta: { runtimeVersion: '1' },
      },
      file,
    );
  }
}
