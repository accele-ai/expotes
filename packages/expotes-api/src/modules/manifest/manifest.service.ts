import type { ExpoUpdatesV1Dto } from "@/common/decorators/expo-updates-v1";
import { BizException } from "@/common/exceptions/biz.exception";
import { ErrorCodeEnum } from "@/constants/error-code.constant";
import { API_URL } from "@/constants/system.config";
import {
	type Database,
	DatabaseService,
} from "@/processors/database/database.service";
import { CDNService } from "@/processors/helper/cdn/cdn.service";
import { assetsTable, manifestsTable } from "@db/schema";
import { Injectable } from "@nestjs/common";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import type {
	ManifestResponse,
	UpdateAsset,
	UpdateManifest,
} from "./manifest.types";

type SelectAsset = typeof assetsTable.$inferSelect;
type InsertManifest = typeof manifestsTable.$inferInsert;
type SelectManifest = typeof manifestsTable.$inferSelect;

@Injectable()
export class ManifestService {
	constructor(
		private readonly db: DatabaseService,
		private readonly cdnService: CDNService,
	) {}

	async endpoint(
		meta: ExpoUpdatesV1Dto,
		appId: string,
	): Promise<ManifestResponse> {
		const manifest = await this.getLatestManifest(appId, meta);
		const response: ManifestResponse = { channel: meta.channel };
		if (!manifest) {
			if (meta.protocolVersion === 0) {
				throw new BizException(ErrorCodeEnum.ManifestNotFound);
			}
			return response;
		}
		if (manifest.isRollbacked) {
			if (meta.protocolVersion === 0) {
				throw new BizException(ErrorCodeEnum.RollbackBadProtocolVersion);
			}
			if (!meta.embeddedUpdateId) {
				throw new BizException(ErrorCodeEnum.InvalidExpoEmbeddedUpdateId);
			}
			if (meta.currentUpdateId === meta.embeddedUpdateId) return response;
			if (!manifest.rollbackedAt) {
				throw new BizException(ErrorCodeEnum.RollbackAtNotFound);
			}
			return {
				...response,
				directive: {
					type: "rollBackToEmbedded",
					parameters: { commitTime: manifest.rollbackedAt.toISOString() },
				},
			};
		}
		if (meta.protocolVersion === 1 && meta.currentUpdateId === manifest.id)
			return response;
		return { ...response, manifest: await this.normalUpdate(meta, manifest) };
	}

	async getLatestManifest(appId: string, meta: ExpoUpdatesV1Dto) {
		return this.db.query.manifestsTable.findFirst({
			where: and(
				eq(manifestsTable.appId, appId),
				eq(manifestsTable.runtimeVersion, meta.runtimeVersion),
				eq(manifestsTable.channel, meta.channel),
				isNotNull(
					meta.platform === "ios"
						? manifestsTable.iosLaunchAssetId
						: manifestsTable.androidLaunchAssetId,
				),
			),
			orderBy: desc(manifestsTable.createdAt),
		});
	}

	async getFullManifest(manifestId: string) {
		const result = await this.db.query.manifestsTable.findFirst({
			where: eq(manifestsTable.id, manifestId),
			with: { assets: true, iosLaunchAsset: true, androidLaunchAsset: true },
		});
		if (!result) throw new BizException(ErrorCodeEnum.ServerNotIdempotent);
		return result;
	}

	private async transformAsset(
		asset: SelectAsset,
		manifest: SelectManifest,
	): Promise<UpdateAsset> {
		let url = `${API_URL}/api/v1/assets/${asset.id}`;
		const storageOption = manifest.options.storage[0];
		if (storageOption) {
			const cdnId = storageOption.cdnIds[0];
			if (cdnId !== undefined) {
				const cdn = await this.cdnService.getCDNProvider(cdnId);
				// Signed CDN URLs expire; the asset endpoint provides a stable manifest URL.
				if (!cdn.requiresSignature) url = cdn.generateUrl({ path: asset.path });
			}
		}
		return {
			hash: asset.hash ?? undefined,
			key: asset.assetKey,
			fileExtension: asset.fileExtension ?? undefined,
			contentType: asset.contentType,
			url,
		};
	}

	async normalUpdate(
		meta: ExpoUpdatesV1Dto,
		manifest: SelectManifest,
	): Promise<UpdateManifest> {
		const fullManifest = await this.getFullManifest(manifest.id);
		const launchAsset =
			meta.platform === "ios"
				? fullManifest.iosLaunchAsset
				: fullManifest.androidLaunchAsset;
		if (!launchAsset) throw new BizException(ErrorCodeEnum.ServerNotIdempotent);
		return {
			id: fullManifest.id,
			createdAt: fullManifest.createdAt.toISOString(),
			runtimeVersion: fullManifest.runtimeVersion,
			launchAsset: await this.transformAsset(launchAsset, manifest),
			assets: await Promise.all(
				fullManifest.assets
					.filter(
						(asset) =>
							asset.id !== fullManifest.iosLaunchAssetId &&
							asset.id !== fullManifest.androidLaunchAssetId &&
							(asset.platform === meta.platform || asset.platform === null),
					)
					.map((asset) => this.transformAsset(asset, manifest)),
			),
			metadata: { ...fullManifest.metadata, channel: meta.channel },
			extra: fullManifest.extra,
		};
	}

	async createManifest(manifest: InsertManifest, tx?: Database) {
		return (tx ?? this.db).insert(manifestsTable).values(manifest);
	}
}
