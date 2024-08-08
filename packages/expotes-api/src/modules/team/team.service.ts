import { teamsTable, usersToTeams } from '@db/schema';
import { Injectable } from '@nestjs/common';
import { CreateTeamDto } from './team.dto';
import { DatabaseService } from '@/processors/database/database.service';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class TeamService {
  constructor(private readonly db: DatabaseService) {}

  create(dto: CreateTeamDto) {
    return this.db.transaction(async (tx) => {
      const team = (
        await tx
          .insert(teamsTable)
          .values({
            id: uuidv7(),
            handle: dto.handle,
          })
          .returning()
      )?.[0];
      await tx
        .insert(usersToTeams)
        .values({ teamId: team.id, userId: dto.userId });
      return team;
    });
  }
}
