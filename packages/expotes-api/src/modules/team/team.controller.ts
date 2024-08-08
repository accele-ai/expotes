import { Body, Post } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './team.dto';
import { Owner } from '@/common/decorators/get-owner-decorator';
import { ApiController } from '@/common/decorators/api-controller.decorator';

@ApiController('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post('/create')
  async create(
    @Owner('userId') userId: string,
    @Body() dto: Omit<CreateTeamDto, 'userId'>,
  ) {
    return this.teamService.create({ ...dto, userId });
  }
}
