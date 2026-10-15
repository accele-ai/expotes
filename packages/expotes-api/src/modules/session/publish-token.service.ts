import { createHash } from "node:crypto";
import { DatabaseService } from "@/processors/database/database.service";
import { applicationsTable, publishTokensTable } from "@db/schema";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { and, eq, gt } from "drizzle-orm";

export interface PublishScope {
	appId: string;
	teamId: string;
	channel: "preview" | "production";
}

@Injectable()
export class PublishTokenService {
	constructor(private readonly db: DatabaseService) {}

	async verify(token: string): Promise<PublishScope> {
		const [scope] = await this.db
			.select({
				appId: publishTokensTable.appId,
				channel: publishTokensTable.channel,
				teamId: applicationsTable.teamId,
			})
			.from(publishTokensTable)
			.innerJoin(
				applicationsTable,
				eq(publishTokensTable.appId, applicationsTable.id),
			)
			.where(
				and(
					eq(
						publishTokensTable.tokenHash,
						createHash("sha256").update(token).digest("hex"),
					),
					gt(publishTokensTable.expiresAt, new Date()),
				),
			)
			.limit(1);
		if (!scope)
			throw new UnauthorizedException("Publish token is invalid or expired");
		return scope;
	}
}
