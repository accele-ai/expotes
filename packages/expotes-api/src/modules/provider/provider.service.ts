import { DatabaseService } from "@/processors/database/database.service";
import {
	cdnProviderTable,
	IStorageProviderSelect,
	storageProviderTable,
} from "@db/schema";
import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import {
	CreateStorageProviderDto,
	UpdateStorageProviderDto,
} from "./provider.dto";

@Injectable()
export class ProviderService {
	constructor(private readonly db: DatabaseService) {}

	async createStorageProvider(dto: CreateStorageProviderDto) {
		return this.db.insert(storageProviderTable).values(dto).returning();
	}

	async getStorageProvider(id: number, teamId: string) {
		return this.db
			.select()
			.from(storageProviderTable)
			.where(
				and(
					eq(storageProviderTable.id, id),
					eq(storageProviderTable.teamId, teamId),
				),
			)
			.limit(1);
	}

	async listStorageProviders(teamId: string) {
		return this.db
			.select()
			.from(storageProviderTable)
			.where(eq(storageProviderTable.teamId, teamId));
	}

	async updateStorageProvider(
		id: number,
		teamId: string,
		data: UpdateStorageProviderDto,
	) {
		return this.db
			.update(storageProviderTable)
			.set({ ...data, updatedAt: new Date() })
			.where(
				and(
					eq(storageProviderTable.id, id),
					eq(storageProviderTable.teamId, teamId),
				),
			)
			.returning();
	}

	async deleteStorageProvider(id: number, teamId: string) {
		return this.db
			.delete(storageProviderTable)
			.where(
				and(
					eq(storageProviderTable.id, id),
					eq(storageProviderTable.teamId, teamId),
				),
			)
			.returning();
	}

	async createCdnProvider(
		data: Omit<
			typeof cdnProviderTable.$inferInsert,
			"id" | "createdAt" | "updatedAt"
		>,
	) {
		return this.db.insert(cdnProviderTable).values(data).returning();
	}

	async getCdnProvider(id: number, teamId: string) {
		return this.db
			.select()
			.from(cdnProviderTable)
			.where(
				and(eq(cdnProviderTable.id, id), eq(cdnProviderTable.teamId, teamId)),
			)
			.limit(1);
	}

	async listCdnProviders(teamId: string) {
		return this.db
			.select()
			.from(cdnProviderTable)
			.where(eq(cdnProviderTable.teamId, teamId));
	}

	async updateCdnProvider(
		id: number,
		teamId: string,
		data: Partial<
			Omit<
				typeof cdnProviderTable.$inferInsert,
				"id" | "createdAt" | "updatedAt"
			>
		>,
	) {
		return this.db
			.update(cdnProviderTable)
			.set({ ...data, updatedAt: new Date() })
			.where(
				and(eq(cdnProviderTable.id, id), eq(cdnProviderTable.teamId, teamId)),
			)
			.returning();
	}

	async deleteCdnProvider(id: number, teamId: string) {
		return this.db
			.delete(cdnProviderTable)
			.where(
				and(eq(cdnProviderTable.id, id), eq(cdnProviderTable.teamId, teamId)),
			)
			.returning();
	}

	// The following methods seem to be duplicates of the above CDN provider methods.
	// They should probably be removed or merged with the above methods.
	// If they are intended to be separate, they should also include teamId checks.

	async createCdn(
		data: Omit<
			typeof cdnProviderTable.$inferInsert,
			"id" | "createdAt" | "updatedAt"
		>,
	) {
		return this.db.insert(cdnProviderTable).values(data).returning();
	}

	async getCdn(id: number, teamId: string) {
		return this.db
			.select()
			.from(cdnProviderTable)
			.where(
				and(eq(cdnProviderTable.id, id), eq(cdnProviderTable.teamId, teamId)),
			)
			.limit(1);
	}

	async listCdns(teamId: string) {
		return this.db
			.select()
			.from(cdnProviderTable)
			.where(eq(cdnProviderTable.teamId, teamId));
	}

	async updateCdn(
		id: number,
		teamId: string,
		data: Partial<
			Omit<
				typeof cdnProviderTable.$inferInsert,
				"id" | "createdAt" | "updatedAt"
			>
		>,
	) {
		return this.db
			.update(cdnProviderTable)
			.set({ ...data, updatedAt: new Date() })
			.where(
				and(eq(cdnProviderTable.id, id), eq(cdnProviderTable.teamId, teamId)),
			)
			.returning();
	}

	async deleteCdn(id: number, teamId: string) {
		return this.db
			.delete(cdnProviderTable)
			.where(
				and(eq(cdnProviderTable.id, id), eq(cdnProviderTable.teamId, teamId)),
			)
			.returning();
	}
}
