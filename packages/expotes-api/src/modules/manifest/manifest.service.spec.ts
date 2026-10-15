import type { ExpoUpdatesV1Dto } from "@/common/decorators/expo-updates-v1";
import type { DatabaseService } from "@/processors/database/database.service";
import type { CDNService } from "@/processors/helper/cdn/cdn.service";
import { TencentCDN } from "@/processors/helper/cdn/tencent.cdn";
import type { assetsTable, manifestsTable } from "@db/schema";
import { PgDialect } from "drizzle-orm/pg-core";
import { ManifestService } from "./manifest.service";

jest.mock("@/constants/system.config", () => ({
	API_URL: "https://updates.example",
}));

const meta: ExpoUpdatesV1Dto = {
	protocolVersion: 1,
	platform: "ios",
	runtimeVersion: "fingerprint",
	channel: "production",
};
const manifest: typeof manifestsTable.$inferSelect = {
	id: "0192ed27-9c91-7cf6-a1dc-03a224b60e9c",
	appId: "0192ed27-9c91-7cf6-a1dc-03a224b60e9d",
	channel: "production",
	runtimeVersion: "fingerprint",
	isRollbacked: false,
	rollbackedAt: null,
	iosLaunchAssetId: "ios-bundle-id",
	androidLaunchAssetId: "android-bundle-id",
	createdAt: new Date("2026-10-15T00:00:00Z"),
	metadata: {},
	extra: {},
	notes: "",
	options: { storage: [] },
};
function asset(
	id: string,
	platform: "ios" | "android" | null,
): typeof assetsTable.$inferSelect {
	return {
		id,
		assetKey: `metro-${id}`,
		platform,
		manifestId: manifest.id,
		path: `/${manifest.id}/${id}`,
		hash: "sha256",
		contentType: "image/png",
		fileExtension: ".png",
	};
}

describe("ManifestService", () => {
	const findFirst = jest.fn();
	let service: ManifestService;
	beforeEach(() => {
		findFirst.mockReset();
		service = new ManifestService(
			{
				query: { manifestsTable: { findFirst } },
			} as unknown as DatabaseService,
			{} as CDNService,
		);
	});

	it.each(["ios", "android"] as const)(
		"constrains %s selection to the app, runtime, channel, and available bundle",
		async (platform) => {
			findFirst.mockResolvedValue(undefined);
			await service.getLatestManifest(manifest.appId, {
				...meta,
				platform,
				channel: "preview",
			});
			const query = new PgDialect().sqlToQuery(
				findFirst.mock.calls[0][0].where,
			);
			expect(query.params).toEqual([
				manifest.appId,
				meta.runtimeVersion,
				"preview",
			]);
			expect(query.sql).toContain(
				`"manifests"."${platform}_launch_asset_id" is not null`,
			);
		},
	);

	it("returns no update for an unknown compatible runtime", async () => {
		findFirst.mockResolvedValue(undefined);
		await expect(service.endpoint(meta, manifest.appId)).resolves.toEqual({
			channel: "production",
		});
	});

	it("returns no update when the installed UUID matches", async () => {
		findFirst.mockResolvedValue(manifest);
		await expect(
			service.endpoint(
				{ ...meta, currentUpdateId: manifest.id },
				manifest.appId,
			),
		).resolves.toEqual({ channel: "production" });
		expect(findFirst).toHaveBeenCalledTimes(1);
	});

	it("returns a rollback directive independently of the manifest", async () => {
		findFirst.mockResolvedValue({
			...manifest,
			isRollbacked: true,
			rollbackedAt: new Date("2026-10-15T01:00:00Z"),
		});
		await expect(
			service.endpoint(
				{
					...meta,
					currentUpdateId: manifest.id,
					embeddedUpdateId: manifest.appId,
				},
				manifest.appId,
			),
		).resolves.toEqual({
			channel: "production",
			directive: {
				type: "rollBackToEmbedded",
				parameters: { commitTime: "2026-10-15T01:00:00.000Z" },
			},
		});
	});

	it("rejects rollback without an embedded update identifier", async () => {
		findFirst.mockResolvedValue({
			...manifest,
			isRollbacked: true,
			rollbackedAt: new Date(),
		});
		await expect(service.endpoint(meta, manifest.appId)).rejects.toThrow(
			"Invalid Expo-Embedded-Update-ID",
		);
	});

	it("rejects rollback for protocol version 0", async () => {
		findFirst.mockResolvedValue({
			...manifest,
			isRollbacked: true,
			rollbackedAt: new Date(),
		});
		await expect(
			service.endpoint({ ...meta, protocolVersion: 0 }, manifest.appId),
		).rejects.toThrow("Rollbacks not supported");
	});

	it("returns no update once the embedded rollback is active", async () => {
		findFirst.mockResolvedValue({
			...manifest,
			isRollbacked: true,
			rollbackedAt: new Date(),
		});
		await expect(
			service.endpoint(
				{
					...meta,
					currentUpdateId: manifest.appId,
					embeddedUpdateId: manifest.appId,
				},
				manifest.appId,
			),
		).resolves.toEqual({ channel: "production" });
	});

	it.each(["A", "B", "C", "D", null] as const)(
		"uses permanent asset URLs for CDN signature type %s",
		async (type) => {
			const cdn = new TencentCDN({
				url: "https://cdn.example",
				key: "test-key",
				key2: "",
				type,
			});
			service = new ManifestService(
				{
					query: { manifestsTable: { findFirst } },
				} as unknown as DatabaseService,
				{
					getCDNProvider: jest.fn().mockResolvedValue(cdn),
				} as unknown as CDNService,
			);
			const image = asset("ios-image", "ios");
			const release = {
				...manifest,
				options: { storage: [{ providerId: 1, cdnIds: [1] }] },
			};
			findFirst.mockResolvedValue({
				...release,
				iosLaunchAsset: asset("ios-bundle-id", "ios"),
				androidLaunchAsset: null,
				assets: [image],
			});
			const first = await service.normalUpdate(meta, release);
			const second = await service.normalUpdate(meta, release);
			expect(first.assets[0].url).toBe(
				type === null
					? `https://cdn.example${image.path}`
					: `https://updates.example/api/v1/assets/${image.id}`,
			);
			expect(first).toEqual(second);
		},
	);

	it.each(["ios", "android"] as const)(
		"preserves Metro keys and excludes the other platform's assets for %s",
		async (platform) => {
			findFirst.mockResolvedValueOnce(manifest).mockResolvedValueOnce({
				...manifest,
				iosLaunchAsset: asset("ios-bundle-id", "ios"),
				androidLaunchAsset: asset("android-bundle-id", "android"),
				assets: [
					asset("ios-bundle-id", "ios"),
					asset("android-bundle-id", "android"),
					asset("ios-image", "ios"),
					asset("android-image", "android"),
					asset("legacy-image", null),
				],
			});
			const response = await service.endpoint(
				{ ...meta, platform },
				manifest.appId,
			);
			expect(response.manifest?.launchAsset.key).toBe(
				`metro-${platform}-bundle-id`,
			);
			expect(response.manifest?.assets.map((entry) => entry.key)).toEqual([
				`metro-${platform}-image`,
				"metro-legacy-image",
			]);
			expect(response.manifest?.metadata).toEqual({ channel: "production" });
		},
	);
});
