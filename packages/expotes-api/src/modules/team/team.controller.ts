import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TeamService } from './team.service';
import {
  Add2TeamDTO,
  CreateTeamDto,
  TeamFindAllDto,
  UpdateTeamDto,
} from './team.dto';
import { Owner } from '@/common/decorators/get-owner-decorator';
import { ApiController } from '@/common/decorators/api-controller.decorator';

@ApiController('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('/list')
  async list(@Body() dto: TeamFindAllDto) {
    return this.teamService.findAll(dto);
  }

  @Post('/create')
  async create(
    @Owner('userId') userId: string,
    @Body() dto: Omit<CreateTeamDto, 'userId'>,
  ) {
    return this.teamService.create({ ...dto, userId });
  }

  @Put('/update')
  async update(@Body() dto: UpdateTeamDto) {
    return this.teamService.update(dto);
  }

  @Post('/add-member')
  async addMember(@Body() dto: Add2TeamDTO) {
    return this.teamService.addMember(dto);
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: string) {
    return this.teamService.delete(id);
  }
}
