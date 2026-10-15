import { createHash } from "node:crypto";
import { assetsTable, manifestsTable } from "@db/schema";
import { ConflictException } from "@nestjs/common";
import AdmZip from "adm-zip";
import { PgDialect } from "drizzle-orm/pg-core";
import type { DatabaseService } from "../../processors/database/database.service";
import type { StorageService } from "../../processors/helper/storage/storage.services";
import type { UpdatePlatform } from "./updates.interface";
import { UpdatesService } from "./updates.service";

const appId = "0192ed27-9c91-7cf6-a1dc-03a224b60e9c";
const teamId = "0192ed27-9c91-7cf6-a1dc-03a224b60e9d";
const request = {
	appId,
	teamId,
	options: { storage: [] },
	meta: { runtimeVersion: "native-fingerprint" },
};

function exportZip(platforms: UpdatePlatform[]) {
	const zip = new AdmZip();
	const fileMetadata = Object.fromEntries(
		platforms.map((platform) => {
			const bundle = `_expo/static/js/${platform}/bundle.hbc`;
			zip.addFile(bundle, Buffer.from(`${platform} bundle`));
			zip.addFile(
				`assets/${platform}-metro-hash`,
				Buffer.from(`${platform} image`),
			);
			return [
				platform,
				{
					bundle,
					assets: [{ path: `assets/${platform}-metro-hash`, ext: "png" }],
				},
			];
		}),
	);
	zip.addFile(
		"metadata.json",
		Buffer.from(JSON.stringify({ version: 0, bundler: "metro", fileMetadata })),
	);
	return { buffer: zip.toBuffer() } as Express.Multer.File;
}

function setup() {
	const rows: { table: unknown; values: unknown }[] = [];
	const changes = { set: jest.fn(), where: jest.fn(), returning: jest.fn() };
	changes.set.mockReturnValue(changes);
	changes.where.mockReturnValue(changes);
	changes.returning.mockResolvedValue([{ id: "published" }]);
	const tx = {
		query: { manifestsTable: { findFirst: jest.fn() } },
		insert: jest.fn((table: unknown) => ({
			values: jest.fn(async (values: unknown) => {
				rows.push({ table, values });
			}),
		})),
		update: jest.fn(() => changes),
	};
	const db = {
		query: {
			applicationsTable: {
				findFirst: jest.fn().mockResolvedValue({ id: appId, teamId }),
			},
			storageProviderTable: {
				findFirst: jest.fn().mockResolvedValue({ id: 1, teamId }),
			},
			cdnProviderTable: {
				findFirst: jest.fn().mockResolvedValue({ id: 2, teamId }),
			},
		},
		transaction: jest.fn(async (fn: (tx: unknown) => unknown) => fn(tx)),
	};
	const storage = {
		uploadBuffer: jest.fn().mockResolvedValue(undefined),
		delete: jest.fn().mockResolvedValue(undefined),
	};
	const storageService = { getStorage: jest.fn().mockResolvedValue(storage) };
	const service = new UpdatesService(
		db as unknown as DatabaseService,
		storageService as unknown as StorageService,
	);
	return { service, db, storage, storageService, rows, changes, tx };
}

describe("Update publication", () => {
	it.each<UpdatePlatform>(["ios", "android"])(
		"publishes a %s-only export with Metro keys and all assets",
		async (platform) => {
			const { service, db, storage, rows, changes } = setup();
			storage.uploadBuffer.mockImplementation(async () => {
				expect(db.transaction).not.toHaveBeenCalled();
			});
			await expect(
				service.createUpdates(request, exportZip([platform])),
			).resolves.toEqual([{ id: "published" }]);
			expect(storage.uploadBuffer).toHaveBeenCalledTimes(2);
			const manifest = rows.find((row) => row.table === manifestsTable)?.values;
			expect(manifest).toMatchObject({
				appId,
				channel: "production",
				runtimeVersion: "native-fingerprint",
			});
			const assets = rows.find((row) => row.table === assetsTable)?.values;
			expect(assets).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ platform, assetKey: "bundle.hbc" }),
					expect.objectContaining({
						platform,
						assetKey: `${platform}-metro-hash`,
						hash: createHash("sha256")
							.update(`${platform} image`)
							.digest("base64url"),
						fileExtension: ".png",
					}),
				]),
			);
			expect(changes.set).toHaveBeenCalledWith(
				expect.objectContaining({
					[platform === "ios" ? "androidLaunchAssetId" : "iosLaunchAssetId"]:
						null,
				}),
			);
		},
	);

	it("publishes both platforms and retains the selected preview channel", async () => {
		const { service, rows, storage } = setup();
		await service.createUpdates(
			{ ...request, channel: "preview" },
			exportZip(["ios", "android"]),
		);
		expect(storage.uploadBuffer).toHaveBeenCalledTimes(4);
		expect(
			rows.find((row) => row.table === manifestsTable)?.values,
		).toMatchObject({ channel: "preview" });
		const assets = rows.find((row) => row.table === assetsTable)
			?.values as (typeof assetsTable.$inferInsert)[];
		expect(
			assets.map((asset) => `${asset.platform}:${asset.assetKey}`),
		).toEqual([
			"ios:bundle.hbc",
			"ios:ios-metro-hash",
			"android:bundle.hbc",
			"android:android-metro-hash",
		]);
	});

	it.each([
		"applicationsTable",
		"storageProviderTable",
		"cdnProviderTable",
	] as const)(
		"refuses publication when the authorized team does not own %s",
		async (table) => {
			const { service, db, storageService } = setup();
			db.query[table].findFirst.mockResolvedValue(undefined);
			await expect(
				service.createUpdates(
					{
						...request,
						options: { storage: [{ providerId: 1, cdnIds: [2] }] },
					},
					exportZip(["ios"]),
				),
			).rejects.toThrow("not found in the authorized team");
			expect(storageService.getStorage).not.toHaveBeenCalled();
			expect(db.transaction).not.toHaveBeenCalled();
			const query = db.query[table].findFirst.mock.calls[0][0];
			expect(new PgDialect().sqlToQuery(query.where).params).toContain(teamId);
		},
	);

	it("preserves upload failure, removes attempted objects, and never publishes a manifest", async () => {
		const { service, db, storage } = setup();
		const failure = new Error("Object storage unavailable");
		storage.uploadBuffer
			.mockResolvedValueOnce(undefined)
			.mockRejectedValueOnce(failure);
		await expect(
			service.createUpdates(request, exportZip(["android"])),
		).rejects.toBe(failure);
		expect(db.transaction).not.toHaveBeenCalled();
		expect(storage.delete).toHaveBeenCalledTimes(2);
	});

	it("keeps uploaded objects when the database commit outcome is unknown", async () => {
		const { service, db, storage } = setup();
		const failure = new Error("Database unavailable");
		db.transaction.mockRejectedValueOnce(failure);
		await expect(
			service.createUpdates(request, exportZip(["ios"])),
		).rejects.toBe(failure);
		expect(storage.delete).not.toHaveBeenCalled();
	});

	it("reports both publication and cleanup failures", async () => {
		const { service, storage } = setup();
		const publishError = new Error("Upload failed");
		const cleanupError = new Error("Delete failed");
		storage.uploadBuffer.mockRejectedValueOnce(publishError);
		storage.delete.mockRejectedValueOnce(cleanupError);
		await expect(
			service.createUpdates(request, exportZip(["ios"])),
		).rejects.toMatchObject({ errors: [publishError, cleanupError] });
	});
});

describe("Update rollback", () => {
	const manifest = {
		id: "0192ed27-9c91-7cf6-a1dc-03a224b60e9e",
		appId,
		channel: "production" as const,
		runtimeVersion: "native-fingerprint",
		iosLaunchAssetId: "ios-bundle",
		androidLaunchAssetId: "android-bundle",
		isRollbacked: false,
		rollbackedAt: null,
	};

	it("rejects rollback if a newer update exists for either included platform", async () => {
		const { service, tx } = setup();
		tx.query.manifestsTable.findFirst
			.mockResolvedValueOnce(manifest)
			.mockResolvedValueOnce(manifest)
			.mockResolvedValueOnce({ ...manifest, id: "newer-android-update" });
		await expect(
			service.rollback(appId, teamId, "production", manifest.id),
		).rejects.toBeInstanceOf(ConflictException);
		expect(tx.update).not.toHaveBeenCalled();
	});

	it("does not change the rollback timestamp when the same update is rolled back twice", async () => {
		const { service, tx } = setup();
		const rolledBack = {
			...manifest,
			isRollbacked: true,
			rollbackedAt: new Date("2026-10-15T10:00:00Z"),
		};
		tx.query.manifestsTable.findFirst.mockResolvedValue(rolledBack);
		await expect(
			service.rollback(appId, teamId, "production", manifest.id),
		).resolves.toBe(rolledBack);
		expect(tx.update).not.toHaveBeenCalled();
	});

	it("returns the committed rollback timestamp when another request wins the update", async () => {
		const { service, tx, changes } = setup();
		const committed = {
			...manifest,
			isRollbacked: true,
			rollbackedAt: new Date("2026-10-15T10:00:00Z"),
		};
		tx.query.manifestsTable.findFirst
			.mockResolvedValueOnce(manifest)
			.mockResolvedValueOnce(manifest)
			.mockResolvedValueOnce(manifest)
			.mockResolvedValueOnce(committed);
		changes.returning.mockResolvedValueOnce([]);
		await expect(
			service.rollback(appId, teamId, "production", manifest.id),
		).resolves.toBe(committed);
		const condition = new PgDialect().sqlToQuery(
			changes.where.mock.calls[0][0],
		);
		expect(condition.params).toEqual([manifest.id, false]);
	});

	it("marks the current update as rolled back only within the requested application and channel", async () => {
		const { service, tx, changes } = setup();
		tx.query.manifestsTable.findFirst.mockResolvedValue(manifest);
		await service.rollback(appId, teamId, "production", manifest.id);
		expect(changes.set).toHaveBeenCalledWith({
			isRollbacked: true,
			rollbackedAt: expect.any(Date),
		});
		const scope = new PgDialect().sqlToQuery(
			tx.query.manifestsTable.findFirst.mock.calls[0][0].where,
		);
		expect(scope.params).toEqual([manifest.id, appId, "production"]);
	});
});
