import { BizException } from "@/common/exceptions/biz.exception";
import { ErrorCodeEnum } from "@/constants/error-code.constant";
import {
	type Database,
	DatabaseService,
} from "@/processors/database/database.service";
import { teamsTable, usersTable, usersToTeams } from "@db/schema";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { SQLWrapper, and, desc, eq, lt } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import {
	Add2TeamDTO,
	CreateTeamDto,
	TeamFindAllDto,
	UpdateTeamDto,
} from "./team.dto";

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
						name: dto.name,
						handle: dto.handle,
					})
					.returning()
			)?.[0];
			await tx
				.insert(usersToTeams)
				.values({ teamId: team.id, userId: dto.userId, role: "admin" });
			return team;
		});
	}

	private async requireAdmin(db: Database, teamId: string, userId: string) {
		const membership = await db.query.usersToTeams.findFirst({
			where: and(
				eq(usersToTeams.teamId, teamId),
				eq(usersToTeams.userId, userId),
			),
		});
		if (membership?.role !== "admin" || membership.isSuspended === true) {
			throw new ForbiddenException("An active team administrator is required");
		}
	}

	delete(teamId: string, userId: string) {
		return this.db.transaction(async (tx) => {
			await this.requireAdmin(tx, teamId, userId);
			await tx.delete(usersToTeams).where(eq(usersToTeams.teamId, teamId));
			const [team] = await tx
				.delete(teamsTable)
				.where(eq(teamsTable.id, teamId))
				.returning();
			if (!team) throw new BizException(ErrorCodeEnum.TeamNotFound);
			return team;
		});
	}

	update(dto: UpdateTeamDto, userId: string) {
		return this.db.transaction(async (tx) => {
			await this.requireAdmin(tx, dto.id, userId);
			if (dto.users.some((user) => user.teamId !== dto.id)) {
				throw new ForbiddenException(
					"Member updates must belong to the selected team",
				);
			}
			const team = await tx
				.update(teamsTable)
				.set({ handle: dto.handle })
				.where(eq(teamsTable.id, dto.id))
				.returning();
			if (team.length === 0) throw new BizException(ErrorCodeEnum.TeamNotFound);
			for (const user of dto.users) {
				await tx
					.update(usersToTeams)
					.set({ role: user.role, isSuspended: user.isSuspended })
					.where(
						and(
							eq(usersToTeams.teamId, dto.id),
							eq(usersToTeams.userId, user.userId),
						),
					);
			}
			return team;
		});
	}

	async findOne(teamId: string, userId?: string) {
		const team = await this.db.query.teamsTable.findFirst({
			where: eq(teamsTable.id, teamId),
		});

		if (userId) {
			const userTeam = await this.db.query.usersToTeams.findFirst({
				where: and(
					eq(usersToTeams.teamId, teamId),
					eq(usersToTeams.userId, userId),
				),
			});

			if (userTeam) {
				// Here you can check the user's role if needed
				// For example: return { ...application, userRole: userTeam.role };
			}
		}

		return team;
	}

	async findAllByUser(userId: string) {
		return this.db
			.select({
				id: usersToTeams.teamId,
				name: teamsTable.name,
				handle: teamsTable.handle,
			})
			.from(usersToTeams)
			.innerJoin(teamsTable, eq(usersToTeams.teamId, teamsTable.id))
			.where(eq(usersToTeams.userId, userId));
	}

	findAll({ size = 10, cursor, ...dto }: TeamFindAllDto) {
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

	async addMember(dto: Add2TeamDTO, userId: string) {
		return this.db.transaction(async (tx) => {
			for (const teamId of new Set(dto.users.map((user) => user.teamId)))
				await this.requireAdmin(tx, teamId, userId);
			for (const user of dto.users) {
				const existing = await tx.query.usersTable.findFirst({
					where: eq(usersTable.id, user.userId),
				});
				if (!existing) throw new BizException(ErrorCodeEnum.UserNotFound);
				await tx.insert(usersToTeams).values(user);
			}
		});
	}
}
