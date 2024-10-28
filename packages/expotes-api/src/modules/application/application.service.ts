import { DatabaseService } from "@/processors/database/database.service";
import { applicationsTable, teamsTable, usersToTeams } from "@db/schema";
import { Injectable } from "@nestjs/common";
import { CreateApplicationDto } from "./application.dto";
import { v7 as uuidv7 } from "uuid";
import { and, eq } from "drizzle-orm";

@Injectable()
export class ApplicationService {
	constructor(private readonly db: DatabaseService) {}

	create(body: CreateApplicationDto) {
		return this.db
			.insert(applicationsTable)
			.values({
				id: uuidv7(),
				...body,
			})
			.returning();
	}

	// async findOne(applicationId: string, teamId: string, userId?: string) {
	async findOne(applicationId: string) {
		const application = await this.db.query.applicationsTable.findFirst({
			where: eq(applicationsTable.id, applicationId),
		});

		if (!application) {
			return null;
		}

		// if (userId) {
		//   const userTeam = await this.db.query.usersToTeams.findFirst({
		//     where: and(
		//       eq(usersToTeams.teamId, teamId),
		//       eq(usersToTeams.userId, userId),
		//     ),
		//   });

		//   if (userTeam) {
		//     // Here you can add user-specific information if needed
		//     // For example: return { ...application, userRole: userTeam.role };
		//   }
		// }

		return application;
	}

	async findOneByHandle(handle: string) {
		const application = await this.db.query.applicationsTable.findFirst({
			where: eq(applicationsTable.handle, handle),
		});

		if (!application) {
			throw new Error("Application not found");
		}

		return application;
	}

	async findAll(teamId: string, userId: string) {
		// First, check if the user is a member of the team
		const userTeam = await this.db.query.usersToTeams.findFirst({
			where: and(
				eq(usersToTeams.teamId, teamId),
				eq(usersToTeams.userId, userId),
			),
		});

		if (!userTeam) {
			throw new Error("User is not a member of this team");
		}

		// If the user is a member, fetch all applications for the team
		const applications = await this.db.query.applicationsTable.findMany({
			where: eq(applicationsTable.teamId, teamId),
		});

		return applications;
	}
}
