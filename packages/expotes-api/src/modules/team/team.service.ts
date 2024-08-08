import { teamsTable, usersTable, usersToTeams } from '@db/schema';
import { Injectable } from '@nestjs/common';
import {
  Add2TeamDTO,
  CreateTeamDto,
  TeamPageQueryDto,
  UpdateTeamDto,
} from './team.dto';
import { DatabaseService } from '@/processors/database/database.service';
import { desc, eq, and, lt, SQLWrapper } from 'drizzle-orm';
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

  /**
   * Retrieves paginated team data based on query conditions.
   *
   * This function fetches team data according to the provided pagination query parameters,
   * which include page size, cursor for pagination,
   * and filter criteria such as team handle and creation date.
   * It supports forward pagination using the cursor.
   *
   * @param {TeamPageQueryDto} dto - The pagination query parameter object, comprising page size, cursor, and filtering conditions.
   * @returns {{ items: Team[]; nextCursor: string | null }} - An object containing the paginated data and the next cursor.
   */
  pageQuery({ size = 10, cursor, ...dto }: TeamPageQueryDto) {
    const cursorCondition = cursor ? lt(teamsTable.id, cursor) : undefined;
    const conditions: SQLWrapper[] = [];

    if (dto.handle !== undefined) {
      conditions.push(eq(teamsTable.handle, dto.handle));
    }

    if (dto.createdAt !== undefined) {
      conditions.push(eq(teamsTable.createdAt, dto.createdAt));
    }

    const result = this.db
      .select()
      .from(teamsTable)
      .where(and(...conditions, cursorCondition))
      .limit(size)
      .orderBy(desc(teamsTable.id));

    const items = Array.isArray(result) ? result : [];
    const nextCursor = items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor };
  }

  /**
   * Asynchronously adds a member to a team.
   *
   * This function first verifies the existence of each user and team in the database, and then adds the user to the team through a database transaction.
   * It mainly solves the problem of the relationship between users and teams, ensuring that each user and team involved are valid, and establishing a corresponding relationship between them.
   *
   * @param dto The data transfer object containing information about users to be added to the team, following the Add2TeamDTO format.
   * @throws {TeamError} Throws a TeamError if a user or team does not exist.
   */
  async addMember(dto: Add2TeamDTO) {
    // Verify the existence of each user and team.
    const checks = dto.users.map(async (user) => {
      const [u, t] = await Promise.all([
        this.db.query.usersTable.findFirst({
          where: eq(usersTable.id, user.userId),
        }),
        this.db.query.teamsTable.findFirst({
          where: eq(teamsTable.id, user.teamId),
        }),
      ]);

      if (!u) throw new TeamError(ErrorConstant.USER_NOT_FOUND);
      if (!t) throw new TeamError(ErrorConstant.TEAM_NOT_FOUND);
    });

    await Promise.all(checks);

    // Use a database transaction to add users to teams.
    return this.db.transaction(async (tx) => {
      const insertPromises = dto.users.map((user) =>
        tx.insert(usersToTeams).values(user),
      );
      await Promise.all(insertPromises);
    });
  }
}
