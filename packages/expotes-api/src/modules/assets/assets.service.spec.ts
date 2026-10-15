import { NotFoundException, StreamableFile } from "@nestjs/common";
import type { DatabaseService } from "../../processors/database/database.service";
import type { StorageService } from "../../processors/helper/storage/storage.services";
import { AssetsService } from "./assets.service";

function setup(asset: unknown) {
	const db = {
		query: { assetsTable: { findFirst: jest.fn().mockResolvedValue(asset) } },
	};
	const storage = {
		download: jest
			.fn()
			.mockResolvedValue(new StreamableFile(Buffer.from("asset bytes"))),
	};
	const storageService = { getStorage: jest.fn().mockResolvedValue(storage) };
	const service = new AssetsService(
		db as unknown as DatabaseService,
		storageService as unknown as StorageService,
	);
	return { service, storageService, storage };
}

describe("Asset downloads", () => {
	it("uses the manifest's storage provider and serves the asset content type", async () => {
		const { service, storageService, storage } = setup({
			path: "/update/assets/hash",
			contentType: "image/png",
			manifest: { options: { storage: [{ providerId: 42, cdnIds: [] }] } },
		});
		const file = await service.getAssetObject("asset-id");
		expect(storageService.getStorage).toHaveBeenCalledWith(42);
		expect(storage.download).toHaveBeenCalledWith("/update/assets/hash");
		expect(file.getHeaders()).toMatchObject({ type: "image/png", length: 11 });
	});

	it("returns 404 for an unknown asset instead of serializing an exception with status 200", async () => {
		const { service, storageService } = setup(undefined);
		await expect(service.getAssetObject("missing-id")).rejects.toBeInstanceOf(
			NotFoundException,
		);
		expect(storageService.getStorage).not.toHaveBeenCalled();
	});
});
