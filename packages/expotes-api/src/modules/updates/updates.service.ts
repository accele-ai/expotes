import * as fs from "node:fs";
import * as path from "node:path";
import { createHash, getBase64URLEncoding } from "@/shared/utils/crypto.util";
import {
	type ManifestsOptions,
	applicationsTable,
	manifestsTable,
} from "@db/schema";
import { Injectable, Logger } from "@nestjs/common";
import AdmZip from "adm-zip";
import { and, desc, eq, gt } from "drizzle-orm";
import {
	Database,
	DatabaseService,
} from "src/processors/database/database.service";
import { v7 as uuidv7 } from "uuid";
import { StorageService } from "../../processors/helper/storage/storage.services";
import { AssetsService } from "../assets/assets.service";
import { ManifestService } from "../manifest/manifest.service";
import { FindAllUpdatesDto, FindAllUpdatesEntity } from "./updates.dto";
import { FileMetadata } from "./updates.interface";
// import mime from 'mime';

@Injectable()
export class UpdatesService {
	logger = new Logger(UpdatesService.name);

	constructor(
		private readonly db: DatabaseService,
		private readonly storageService: StorageService,
		private readonly manifestService: ManifestService,
		private readonly assetsService: AssetsService,
	) {}

	private createAssetS3Key(mainfestId: string, assetName: string): string {
		return `/${mainfestId}/${assetName}`;
	}

	private async createAsset(
		{
			assetId,
			runtimeVersion,
			manifestId,
			contentType,
			fileExtension,
			fileName,
			localPath,
			options,
		}: {
			assetId?: string;
			runtimeVersion: string;
			manifestId: string;
			contentType: string;
			fileExtension: string;
			fileName: string;
			localPath: string;
			options: ManifestsOptions;
		},
		tx?: Database,
	) {
		const s3Path = this.createAssetS3Key(manifestId, fileName);

		const fileBuffer = await fs.promises.readFile(localPath);
		if (options.storage.length > 0) {
			for (const storageOption of options.storage) {
				const storage = await this.storageService.getStorage(
					storageOption.providerId,
				);
				await storage.uploadBuffer({
					key: s3Path,
					buffer: fileBuffer,
					extras: {
						ContentType: contentType,
					},
				});
			}
		} else {
			// default storage
			const storage = await this.storageService.getStorage();

			await storage.uploadBuffer({
				key: s3Path,
				buffer: fileBuffer,
				extras: {
					ContentType: contentType,
				},
			});
		}

		await this.assetsService.createAsset(
			{
				id: assetId ?? uuidv7(),
				hash: getBase64URLEncoding(createHash(fileBuffer, "sha256", "base64")),
				path: s3Path,
				manifestId,
				contentType,
				fileExtension,
			},
			tx,
		);
	}

	/* Create updates by creating a new manifest and assets */
	async createUpdates(
		{
			appId,
			options,
			meta,
			notes,
		}: {
			appId: string;
			options: ManifestsOptions;
			meta: { runtimeVersion: string };
			notes?: string;
		},
		file: Express.Multer.File,
	) {
		if (!file) {
			throw new Error("No file uploaded");
		}

		const manifestId = uuidv7();

		const extractPath = `tmp/extracted/${manifestId}/`;
		if (!fs.existsSync(extractPath)) {
			fs.mkdirSync(extractPath, { recursive: true });
		}

		const zip = new AdmZip(file.buffer);
		await zip.extractAllToAsync(extractPath, true);

		const metadataPath = path.join(extractPath, "metadata.json");

		if (!fs.existsSync(metadataPath)) {
			throw new Error("metadata.json not found in ZIP file");
		}

		const metadata: FileMetadata = JSON.parse(
			fs.readFileSync(metadataPath, "utf8"),
		);

		// const expoConfigPath = path.join(extractPath, 'expoConfig.json');
		// const expoConfig = fs.existsSync(metadataPath)
		//   ? JSON.parse(fs.readFileSync(expoConfigPath, 'utf8'))
		//   : undefined;

		try {
			const fileMetadata = metadata.fileMetadata;
			const manifest = await this.db.transaction(async (tx) => {
				await tx.insert(manifestsTable).values({
					id: manifestId,
					appId,
					runtimeVersion: meta.runtimeVersion,
					createdAt: new Date(),
					// extra: {
					//   expoClient: expoConfig,
					// },
					options,
					notes,
				});

				const iosLaunchAssetId = fileMetadata.ios ? uuidv7() : null;
				const iosBundlePath = fileMetadata.ios.bundle
					? path.join(extractPath, fileMetadata.ios.bundle)
					: null;

				const assetsPromises = [];
				const mime = (await import("mime")).default;
				if (iosLaunchAssetId && iosBundlePath) {
					assetsPromises.push(
						this.createAsset(
							{
								assetId: iosLaunchAssetId,
								runtimeVersion: meta.runtimeVersion,
								manifestId,
								fileName: fileMetadata.ios.bundle,
								localPath: iosBundlePath,
								fileExtension: ".bundle",
								contentType: "application/javascript",
								options,
							},
							tx,
						),
					);

					assetsPromises.push(
						...fileMetadata.ios.assets.map((asset) => {
							const contentType = mime.getType(asset.ext);
							if (!contentType) {
								throw new Error(`Unsupported file type: ${asset.ext}`);
							}
							return this.createAsset(
								{
									manifestId,
									runtimeVersion: meta.runtimeVersion,
									contentType: contentType,
									fileExtension: `.${asset.ext}`,
									fileName: asset.path,
									localPath: path.join(extractPath, asset.path),
									options,
								},
								tx,
							);
						}),
					);
				}
				const androidLaunchAssetId = fileMetadata.android ? uuidv7() : null;
				const androidBundlePath = fileMetadata.android.bundle
					? path.join(extractPath, fileMetadata.android.bundle)
					: null;
				if (androidLaunchAssetId && androidBundlePath) {
					assetsPromises.push(
						this.createAsset(
							{
								assetId: androidLaunchAssetId,
								runtimeVersion: meta.runtimeVersion,
								manifestId,
								fileName: fileMetadata.android.bundle,
								localPath: androidBundlePath,
								fileExtension: ".bundle",
								contentType: "application/javascript",
								options,
							},
							tx,
						),
					);
				}

				await Promise.all(assetsPromises);

				return await tx
					.update(manifestsTable)
					.set({
						iosLaunchAssetId,
						androidLaunchAssetId,
						createdAt: new Date(),
					})
					.where(eq(manifestsTable.id, manifestId))
					.returning();
			});

			// 删除上传的ZIP文件（可选）
			// fs.unlinkSync(extractPath);
			console.log(manifest);
			return manifest;
		} catch (e) {
			console.log(e);
		}
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
		).map((r) => {
			return {
				...r.manifests,
				appId: undefined,
				application: r.applications,
			};
		});
	}
}
