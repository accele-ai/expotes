import { roleEnum, teamsTable, usersToTeams } from '@expotes/db/schema';
import { Injectable } from '@nestjs/common';
import { CreateTeamDto, UpdateTeamDto } from './team.dto';
import { DatabaseService } from '@/processors/database/database.service';
import { eq } from 'drizzle-orm';

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

  delete(teamId: string) {
    return this.db.transaction(async (tx) => {
      const team = (
        await tx.delete(teamsTable).where(eq(teamsTable.id, teamId)).returning()
      )?.[0];
      if (!team) {
        throw new Error('Team not found');
      }
      await tx
        .delete(usersToTeams)
        .where(eq(usersToTeams.teamId, teamId))
        .returning()?.[0];
      return team;
    });
  }

  update(dto: UpdateTeamDto) {
    return this.db.transaction(async (tx) => {
      const team = await tx
        .update(teamsTable)
        .set({
          handle: dto.handle,
        })
        .where(eq(teamsTable.id, dto.id))
        .returning()?.[0];
      if (!team) {
        throw new Error('Team not found');
      }

      for (const user of dto.users) {
        await tx
          .update(usersToTeams)
          .set({
            // role: user.role,
            // isSuspend: user.isSuspend,
          })
          .where(
            eq(usersToTeams.teamId, user.teamId) &&
              eq(usersToTeams.userId, user.userId),
          );
      }

      return team;
    });
  }

  // TODO 分页查询
}
