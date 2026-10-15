import { assetsTable } from "@db/schema";
import { Injectable, NotFoundException, StreamableFile } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../../processors/database/database.service";
import { StorageService } from "../../processors/helper/storage/storage.services";

@Injectable()
export class AssetsService {
	constructor(
		private readonly db: DatabaseService,
		private readonly storageService: StorageService,
	) {}

	async getAssetObject(assetId: string) {
		const asset = await this.db.query.assetsTable.findFirst({
			where: eq(assetsTable.id, assetId),
			with: { manifest: { columns: { options: true } } },
		});
		if (!asset) throw new NotFoundException("Asset not found");
		const storage = await this.storageService.getStorage(
			asset.manifest.options.storage[0]?.providerId,
		);
		const file = await storage.download(asset.path);
		return new StreamableFile(file.getStream(), {
			...file.getHeaders(),
			type: asset.contentType,
		});
	}
}
