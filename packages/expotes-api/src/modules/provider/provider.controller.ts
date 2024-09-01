import { Body, Controller } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { TypedParam, TypedRoute } from '@nestia/core';
import {
  CreateStorageProviderDto,
  UpdateStorageProviderDto,
  StorageProviderResponseDto,
  CreateCdnProviderDto,
  UpdateCdnProviderDto,
  CdnProviderResponseDto,
} from './provider.dto';
import { Owner, Team } from '@/common/decorators/get-owner-decorator';
import { ISessionPayload } from '../session/session.dto';
import { ApiController } from '@/common/decorators/api-controller.decorator';

@ApiController('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @TypedRoute.Post('storage')
  async createStorageProvider(
    @Body() dto: Omit<CreateStorageProviderDto, 'teamId'>,
    @Team('id') teamId: string,
  ) {
    return this.providerService.createStorageProvider({ ...dto, teamId });
  }

  @TypedRoute.Get('storage/:id')
  async getStorageProvider(
    @TypedParam('id') id: number,
    @Team('id') teamId: string,
  ) {
    return this.providerService.getStorageProvider(id, teamId);
  }

  @TypedRoute.Get('storage')
  async listStorageProviders(@Team('id') teamId: string) {
    return this.providerService.listStorageProviders(teamId);
  }

  @TypedRoute.Put('storage/:id')
  async updateStorageProvider(
    @TypedParam('id') id: number,
    @Body() data: UpdateStorageProviderDto,
    @Team('id') teamId: string,
  ) {
    return this.providerService.updateStorageProvider(id, teamId, data);
  }

  @TypedRoute.Delete('storage/:id')
  async deleteStorageProvider(
    @TypedParam('id') id: number,
    @Team('id') teamId: string,
  ) {
    return this.providerService.deleteStorageProvider(id, teamId);
  }

  @TypedRoute.Post('cdn')
  async createCdnProvider(
    @Body() data: CreateCdnProviderDto,
    @Team('id') teamId: string,
  ) {
    return this.providerService.createCdnProvider({ ...data, teamId });
  }

  @TypedRoute.Get('cdn/:id')
  async getCdnProvider(
    @TypedParam('id') id: number,
    @Team('id') teamId: string,
  ) {
    return this.providerService.getCdnProvider(id, teamId);
  }

  @TypedRoute.Get('cdn')
  async listCdnProviders(@Team('id') teamId: string) {
    return this.providerService.listCdnProviders(teamId);
  }

  @TypedRoute.Put('cdn/:id')
  async updateCdnProvider(
    @TypedParam('id') id: number,
    @Body() data: UpdateCdnProviderDto,
    @Team('id') teamId: string,
  ) {
    return this.providerService.updateCdnProvider(id, teamId, data);
  }

  @TypedRoute.Delete('cdn/:id')
  async deleteCdnProvider(
    @TypedParam('id') id: number,
    @Team('id') teamId: string,
  ) {
    return this.providerService.deleteCdnProvider(id, teamId);
  }
}
