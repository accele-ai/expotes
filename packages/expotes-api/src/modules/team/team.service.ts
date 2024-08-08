import { teamsTable, usersToTeams } from '@db/schema';
import { Injectable } from '@nestjs/common';
import { CreateTeamDto, UpdateTeamDto } from './team.dto';
import { DatabaseService } from '@/processors/database/database.service';
import { eq } from 'drizzle-orm';
import { TeamError } from '@/common/exceptions/team.exception';
import { ErrorConstant } from '@/constants/exception.constant';

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

  /**
   * Delete the specified team
   *
   * This method deletes the team with the given ID using a database transaction.
   * If the team does not exist, it throws an error.
   * Additionally, this method deletes all user-team associations related to the team.
   *
   * @param teamId The unique identifier of the team.
   * @returns The deleted team object.
   * @throws Throws a TeamError if the team does not exist.
   */
  delete(teamId: string) {
    return this.db.transaction(async (tx) => {
      const team = (
        await tx.delete(teamsTable).where(eq(teamsTable.id, teamId)).returning()
      )?.[0];

      if (!team) {
        throw new TeamError(ErrorConstant.TEAM_NOT_FOUND);
      }

      // Delete all user-team associations related to the team
      await tx.delete(usersToTeams).where(eq(usersToTeams.teamId, teamId));

      return team;
    });
  }

  /**
   * Update team information
   *
   * This method updates the team's details,
   * including the team identifier and member role assignments,
   * using a database transaction.
   * The transaction ensures data consistency,
   * particularly when updating team member roles.
   *
   * @param dto The Update Team DTO, containing the team information and member details to be updated.
   * @returns The updated team information.
   * @throws Throws an error if the team does not exist.
   */
  update(dto: UpdateTeamDto) {
    return this.db.transaction(async (tx) => {
      // Update basic team information, such as the identifier
      const team = await tx
        .update(teamsTable)
        .set({
          handle: dto.handle,
        })
        .where(eq(teamsTable.id, dto.id))
        .returning();

      // Throw an error if the team is not found
      if (!team) {
        throw new Error(ErrorConstant.TEAM_NOT_FOUND);
      }

      // Update member's status
      for (const user of dto.users) {
        await tx
          .update(usersToTeams)
          .set({
            role: user.role,
            isSuspended: user.isSuspended,
          })
          .where(
            eq(usersToTeams.teamId, user.teamId) &&
              eq(usersToTeams.userId, user.userId),
          );
      }
      return team;
    });
  }
}
