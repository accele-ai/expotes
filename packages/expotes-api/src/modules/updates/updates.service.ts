import { createHash } from "node:crypto";
import * as path from "node:path";
import {
	type ManifestsOptions,
	applicationsTable,
	assetsTable,
	cdnProviderTable,
	manifestsTable,
	storageProviderTable,
} from "@db/schema";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { isUUID } from "class-validator";
import { and, desc, eq, gt, isNotNull } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { DatabaseService } from "../../processors/database/database.service";
import type { AbstractObjectStorage } from "../../processors/helper/storage/abstract.storage";
import { StorageService } from "../../processors/helper/storage/storage.services";
import { UpdateArchive } from "./updates.archive";
import type { FindAllUpdatesDto } from "./updates.dto";
import type { UpdateChannel, UpdatePlatform } from "./updates.interface";

type InsertAsset = typeof assetsTable.$inferInsert;

interface CreateUpdate {
	appId: string;
	teamId: string;
	channel?: UpdateChannel;
	options: ManifestsOptions;
	meta: { runtimeVersion: string };
	notes?: string;
}

@Injectable()
export class UpdatesService {
	constructor(
		private readonly db: DatabaseService,
		private readonly storageService: StorageService,
	) {}

	private async authorize(
		appId: string,
		teamId: string,
		options: ManifestsOptions,
	) {
		if (!teamId)
			throw new ForbiddenException(
				"Select an authorized team before publishing updates",
			);
		const app = await this.db.query.applicationsTable.findFirst({
			where: and(
				eq(applicationsTable.id, appId),
				eq(applicationsTable.teamId, teamId),
			),
		});
		if (!app)
			throw new NotFoundException(
				"Application not found in the authorized team",
			);
		for (const option of options.storage) {
			const provider = await this.db.query.storageProviderTable.findFirst({
				where: and(
					eq(storageProviderTable.id, option.providerId),
					eq(storageProviderTable.teamId, teamId),
				),
			});
			if (!provider)
				throw new NotFoundException(
					"Storage provider not found in the authorized team",
				);
			for (const cdnId of option.cdnIds) {
				const cdn = await this.db.query.cdnProviderTable.findFirst({
					where: and(
						eq(cdnProviderTable.id, cdnId),
						eq(cdnProviderTable.teamId, teamId),
					),
				});
				if (!cdn)
					throw new NotFoundException(
						"CDN provider not found in the authorized team",
					);
			}
		}
	}

	async createUpdates(
		{
			appId,
			teamId,
			channel = "production",
			options,
			meta,
			notes,
		}: CreateUpdate,
		file: Express.Multer.File,
	) {
		if (typeof appId !== "string" || !isUUID(appId)) {
			throw new BadRequestException("appId must be a UUID");
		}
		if (
			typeof meta.runtimeVersion !== "string" ||
			meta.runtimeVersion.length === 0
		) {
			throw new BadRequestException("runtimeVersion must be a nonempty string");
		}
		if (channel !== "production" && channel !== "preview") {
			throw new BadRequestException("channel must be preview or production");
		}
		if (notes !== undefined && typeof notes !== "string") {
			throw new BadRequestException("notes must be a string");
		}
		await this.authorize(appId, teamId, options);
		if (!file?.buffer)
			throw new BadRequestException("An update ZIP file is required");

		const archive = new UpdateArchive(file.buffer);
		const manifestId = uuidv7();
		const assets: InsertAsset[] = [];
		const files = new Map<string, { buffer: Buffer; contentType: string }>();
		const launchAssets: Partial<Record<UpdatePlatform, string>> = {};
		const mime = (await import("mime")).default;
		for (const platform of ["ios", "android"] as const) {
			const metadata = archive.platforms[platform];
			if (!metadata) continue;
			const platformAssets = [
				{
					path: metadata.bundle,
					ext: "bundle",
					contentType: "application/javascript",
				},
				...metadata.assets.map((asset) => {
					const contentType = mime.getType(asset.ext);
					if (!contentType)
						throw new BadRequestException(
							`Unsupported asset extension: ${asset.ext}`,
						);
					return { ...asset, contentType };
				}),
			];
			for (const asset of platformAssets) {
				const id = uuidv7();
				const buffer =
					files.get(asset.path)?.buffer ?? archive.readFile(asset.path);
				const objectPath = `/${manifestId}/${asset.path}`;
				files.set(asset.path, { buffer, contentType: asset.contentType });
				assets.push({
					id,
					manifestId,
					platform,
					assetKey: path.posix.basename(asset.path),
					hash: createHash("sha256").update(buffer).digest("base64url"),
					path: objectPath,
					contentType: asset.contentType,
					fileExtension: `.${asset.ext}`,
				});
				if (asset.path === metadata.bundle) launchAssets[platform] = id;
			}
		}

		const providers =
			options.storage.length > 0
				? await Promise.all(
						options.storage.map((option) =>
							this.storageService.getStorage(option.providerId),
						),
					)
				: [await this.storageService.getStorage()];
		const uploaded: { storage: AbstractObjectStorage; key: string }[] = [];
		try {
			for (const [filePath, { buffer, contentType }] of files) {
				const key = `/${manifestId}/${filePath}`;
				for (const storage of providers) {
					uploaded.push({ storage, key });
					await storage.uploadBuffer({
						key,
						buffer,
						extras: { ContentType: contentType },
					});
				}
			}
		} catch (error) {
			const cleanup = await Promise.allSettled(
				uploaded.map(({ storage, key }) => storage.delete(key)),
			);
			const cleanupErrors = cleanup.flatMap((result) =>
				result.status === "rejected" ? [result.reason] : [],
			);
			if (cleanupErrors.length > 0) {
				throw new AggregateError(
					[error, ...cleanupErrors],
					"Update publication and asset cleanup failed",
				);
			}
			throw error;
		}
		// Keep objects after a transaction error: COMMIT may have succeeded before the connection failed.
		// Readers can see the manifest only after every asset is uploaded and the transaction commits.
		return await this.db.transaction(async (tx) => {
			await tx.insert(manifestsTable).values({
				id: manifestId,
				appId,
				channel,
				runtimeVersion: meta.runtimeVersion,
				createdAt: new Date(),
				options,
				notes,
			});
			await tx.insert(assetsTable).values(assets);
			return tx
				.update(manifestsTable)
				.set({
					iosLaunchAssetId: launchAssets.ios ?? null,
					androidLaunchAssetId: launchAssets.android ?? null,
				})
				.where(eq(manifestsTable.id, manifestId))
				.returning();
		});
	}

	async rollback(
		appId: string,
		teamId: string,
		channel: UpdateChannel,
		manifestId: string,
	) {
		if (
			!isUUID(appId) ||
			!isUUID(manifestId) ||
			(channel !== "preview" && channel !== "production")
		) {
			throw new BadRequestException(
				"Valid application, manifest, and channel are required",
			);
		}
		await this.authorize(appId, teamId, { storage: [] });
		return this.db.transaction(async (tx) => {
			const manifest = await tx.query.manifestsTable.findFirst({
				where: and(
					eq(manifestsTable.id, manifestId),
					eq(manifestsTable.appId, appId),
					eq(manifestsTable.channel, channel),
				),
			});
			if (!manifest)
				throw new NotFoundException(
					"Update not found in this application and channel",
				);
			for (const launchAsset of [
				"iosLaunchAssetId",
				"androidLaunchAssetId",
			] as const) {
				if (!manifest[launchAsset]) continue;
				const latest = await tx.query.manifestsTable.findFirst({
					where: and(
						eq(manifestsTable.appId, appId),
						eq(manifestsTable.channel, channel),
						eq(manifestsTable.runtimeVersion, manifest.runtimeVersion),
						isNotNull(manifestsTable[launchAsset]),
					),
					orderBy: desc(manifestsTable.createdAt),
				});
				if (latest?.id !== manifest.id)
					throw new ConflictException(
						"Only the latest update for every included platform can be rolled back",
					);
			}
			if (manifest.isRollbacked) return manifest;
			const [rolledBack] = await tx
				.update(manifestsTable)
				.set({ isRollbacked: true, rollbackedAt: new Date() })
				.where(
					and(
						eq(manifestsTable.id, manifest.id),
						eq(manifestsTable.isRollbacked, false),
					),
				)
				.returning();
			if (rolledBack) return rolledBack;

			// A concurrent rollback owns the timestamp; return the committed result.
			const committed = await tx.query.manifestsTable.findFirst({
				where: and(
					eq(manifestsTable.id, manifest.id),
					eq(manifestsTable.isRollbacked, true),
				),
			});
			if (!committed)
				throw new NotFoundException("Rolled-back update no longer exists");
			return committed;
		});
	}

	async listUpdates({
		appId,
		teamId,
		size,
		cursor,
	}: FindAllUpdatesDto & { teamId: string }) {
		return (
			await this.db
				.select()
				.from(manifestsTable)
				.limit(size)
				.innerJoin(
					applicationsTable,
					eq(manifestsTable.appId, applicationsTable.id),
				)
				.where(
					and(
						eq(applicationsTable.teamId, teamId),
						appId ? eq(manifestsTable.appId, appId) : undefined,
						cursor ? gt(manifestsTable.id, cursor) : undefined,
					),
				)
				.orderBy(desc(manifestsTable.createdAt))
		).map((row) => ({
			...row.manifests,
			appId: undefined,
			application: row.applications,
		}));
	}
}
