import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto, UpdateTeamDto } from './team.dto';
import { Owner } from '@/common/decorators/get-owner-decorator';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post('/create')
  async create(
    @Owner('userId') userId: string,
    @Body() dto: Omit<CreateTeamDto, 'userId'>,
  ) {
    return this.teamService.create({ ...dto, userId });
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: string) {
    return this.teamService.delete(id);
  }

  @Post('/update')
  async update(@Body() dto: UpdateTeamDto) {
    return this.teamService.update(dto);
  }
}
