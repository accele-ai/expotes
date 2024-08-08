import { teamsTable, usersToTeams } from '@db/schema';
import { Injectable } from '@nestjs/common';
import { CreateTeamDto } from './team.dto';
import { DatabaseService } from '@/processors/database/database.service';

@Injectable()
export class TeamService {
  constructor(private readonly db: DatabaseService) {}

  create(dto: CreateTeamDto) {
    return this.db.transaction(async (tx) => {
      const team = (await tx.insert(teamsTable).values(dto).returning())?.[0];
      await tx
        .insert(usersToTeams)
        .values({ teamId: team.id, userId: dto.userId });
      return team;
    });
  }
}
