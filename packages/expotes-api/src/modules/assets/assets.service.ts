import { assetsTable, manifestsTable } from "@db/schema";
import { Injectable, NotFoundException } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import {
	Database,
	DatabaseService,
} from "src/processors/database/database.service";
import { ManifestService } from "../manifest/manifest.service";
import { StorageService } from "../../processors/helper/storage/storage.services";
import { ExpoUpdatesV1Dto } from "@/common/decorators/expo-updates-v1";

type InsertAsset = typeof assetsTable.$inferInsert;

@Injectable()
export class AssetsService {
	constructor(
		private readonly db: DatabaseService,
		private readonly storageService: StorageService,
		private readonly manifestService: ManifestService,
	) {}

	async getAssetObject(assetId: string) {
		const asset = await this.db.query.assetsTable.findFirst({
			where: eq(assetsTable.id, assetId),
		});
		if (!asset) {
			return new NotFoundException("Asset not found");
		}
		const storage = await this.storageService.getStorage();
		return storage.download(asset.path);
	}

	async createAsset(asset: InsertAsset, tx?: Database) {
		return await (tx ?? this.db).insert(assetsTable).values(asset);
	}
}
