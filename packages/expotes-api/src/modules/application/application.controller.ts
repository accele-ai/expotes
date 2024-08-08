import { Body, Post } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './application.dto';
import { ApiController } from '@/common/decorators/api-controller.decorator';

@ApiController('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post('create')
  create(@Body() body: CreateApplicationDto) {
    return this.applicationService.create(body);
  }
}
