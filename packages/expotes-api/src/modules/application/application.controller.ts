import { Body } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './application.dto';
import { ApiController } from '@/common/decorators/api-controller.decorator';
import { TypedQuery, TypedRoute } from '@nestia/core';

@ApiController('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @TypedRoute.Post('create')
  async create(@Body() body: CreateApplicationDto) {
    return await this.applicationService.create(body);
  }

  @TypedRoute.Get('list')
  async list(@TypedQuery() { teamId }: { teamId: string }) {
    return await this.applicationService.findAll(teamId);
  }
}
