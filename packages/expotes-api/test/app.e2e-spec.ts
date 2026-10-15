import assert from "node:assert/strict";
import { createHash, randomBytes, verify } from "node:crypto";
import { basename } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import AdmZip from "adm-zip";
import { parseDictionary } from "structured-headers";
import { v7 as uuidv7 } from "uuid";
import type { UpdateManifest } from "../src/modules/manifest/manifest.types";
import { IntegrationFixture } from "./integration-fixture";

type Platform = "ios" | "android";
type Channel = "preview" | "production";
type StorageOptions = { storage: { providerId: number; cdnIds: number[] }[] };

function exportArchive(platforms: Platform[]) {
	const zip = new AdmZip();
	const files = new Map<string, Buffer>();
	const image = Buffer.from(
		"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jf9sAAAAASUVORK5CYII=",
		"base64",
	);
	const assetPath = `assets/${createHash("md5").update(image).digest("hex")}`;
	files.set(assetPath, image);
	const fileMetadata: Partial<
		Record<
			Platform,
			{ bundle: string; assets: { path: string; ext: string }[] }
		>
	> = {};
	for (const platform of platforms) {
		const bundle = `_expo/static/js/${platform}/fixture.js`;
		files.set(
			bundle,
			Buffer.from(`globalThis.expotesFixture = "${platform}";`),
		);
		fileMetadata[platform] = {
			bundle,
			assets: [{ path: assetPath, ext: "png" }],
		};
	}
	zip.addFile(
		"metadata.json",
		Buffer.from(JSON.stringify({ version: 0, bundler: "metro", fileMetadata })),
	);
	for (const [path, contents] of files) zip.addFile(path, contents);
	return { zip: zip.toBuffer(), files, fileMetadata };
}

function signatureBytes(header: string | null): Buffer {
	assert(header, "The signed response must contain expo-signature");
	const dictionary = parseDictionary(header);
	expect(dictionary.get("keyid")?.[0]).toBe("main");
	expect(dictionary.get("alg")?.[0]).toBe("rsa-v1_5-sha256");
	const signature = dictionary.get("sig")?.[0];
	assert(
		typeof signature === "string",
		"The signature must be a base64 string",
	);
	return Buffer.from(signature, "base64");
}

describe("Expotes production API with PostgreSQL, Redis, and S3 storage", () => {
	const fixture = new IntegrationFixture();
	let productionToken: string;
	let previewToken: string;

	async function token(
		channel: Channel = "production",
		expiresAt = new Date(Date.now() + 3_600_000),
	) {
		const value = randomBytes(32).toString("base64url");
		await fixture.sql`INSERT INTO publish_tokens (id, token_hash, app_id, channel, expires_at) VALUES (${uuidv7()}, ${createHash("sha256").update(value).digest("hex")}, ${fixture.appId}, ${channel}, ${expiresAt.toISOString()})`;
		return value;
	}

	function upload(
		authorization: string,
		runtime: string,
		archive: Buffer,
		options: {
			appId?: string;
			channel?: Channel;
			storage?: StorageOptions;
		} = {},
	) {
		const form = new FormData();
		form.set("appId", options.appId ?? fixture.appId);
		form.set("runtimeVersion", runtime);
		form.set("channel", options.channel ?? "production");
		form.set("options", JSON.stringify(options.storage ?? { storage: [] }));
		form.set(
			"file",
			new Blob([new Uint8Array(archive)], { type: "application/zip" }),
			"export.zip",
		);
		return fetch(`${fixture.url}/api/v1/updates/create`, {
			method: "POST",
			headers: { Authorization: `Bearer ${authorization}` },
			body: form,
		});
	}

	function update(
		runtime: string,
		platform: Platform,
		headers: Record<string, string> = {},
		query = "",
	) {
		return fetch(`${fixture.url}/api/v1/manifest/${fixture.appId}${query}`, {
			headers: {
				Accept: "multipart/mixed",
				"expo-protocol-version": "1",
				"expo-runtime-version": runtime,
				"expo-platform": platform,
				...headers,
			},
		});
	}

	async function publish(
		runtime: string,
		authorization = productionToken,
		channel: Channel = "production",
	) {
		const response = await upload(
			authorization,
			runtime,
			exportArchive(["ios"]).zip,
			{ channel },
		);
		expect(response.status).toBe(201);
		const [manifest]: { id: string }[] = await response.json();
		return manifest.id;
	}

	function rollback(manifestId: string) {
		return fetch(`${fixture.url}/api/v1/updates/rollback`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${productionToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ appId: fixture.appId, manifestId }),
		});
	}

	beforeAll(async () => {
		await fixture.start();
		productionToken = await token();
		previewToken = await token("preview");
	});
	afterAll(() => fixture.stop());

	it("migrates existing assets to Metro keys without changing their ownership", async () => {
		const [asset] =
			await fixture.sql`SELECT asset_key, platform, manifest_id FROM assets WHERE id = ${fixture.legacyAssetId}`;
		expect(asset).toEqual({
			asset_key: "metro-legacy-key",
			platform: null,
			manifest_id: fixture.legacyManifestId,
		});
		const [manifest] =
			await fixture.sql`SELECT channel FROM manifests WHERE id = ${fixture.legacyManifestId}`;
		expect(manifest.channel).toBe("production");
	});

	it.each([
		{ label: "iOS", platforms: ["ios"] as Platform[], customStorage: false },
		{
			label: "Android",
			platforms: ["android"] as Platform[],
			customStorage: true,
		},
		{
			label: "iOS and Android",
			platforms: ["ios", "android"] as Platform[],
			customStorage: true,
		},
	])(
		"publishes $label exports and delivers signed manifests with matching assets",
		async ({ label, platforms, customStorage }) => {
			const runtime = `fingerprint-${label.replaceAll(" ", "-")}`;
			const archive = exportArchive(platforms);
			const storage = {
				storage: customStorage
					? [{ providerId: fixture.providerId, cdnIds: [fixture.cdnId] }]
					: [],
			};
			const uploaded = await upload(productionToken, runtime, archive.zip, {
				storage,
			});
			expect(uploaded.status).toBe(201);
			const [published]: { id: string }[] = await uploaded.json();
			for (const platform of platforms) {
				const response = await update(runtime, platform, {
					Accept: "application/expo+json",
					"expo-expect-signature": 'sig, keyid="main", alg="rsa-v1_5-sha256"',
				});
				expect(response.status).toBe(200);
				expect(response.headers.get("expo-protocol-version")).toBe("1");
				expect(response.headers.get("expo-manifest-filters")).toBe(
					'channel="production"',
				);
				expect(response.headers.get("cache-control")).toBe(
					"private, max-age=0",
				);
				const body = await response.text();
				const signature = signatureBytes(
					response.headers.get("expo-signature"),
				);
				expect(
					verify("RSA-SHA256", Buffer.from(body), fixture.publicKey, signature),
				).toBe(true);
				expect(
					verify(
						"RSA-SHA256",
						Buffer.from(`${body} `),
						fixture.publicKey,
						signature,
					),
				).toBe(false);
				const manifest: UpdateManifest = JSON.parse(body);
				expect(manifest.id).toBe(published.id);
				expect(manifest.runtimeVersion).toBe(runtime);
				expect(manifest.assets).toHaveLength(1);
				const metadata = archive.fileMetadata[platform];
				assert(metadata);
				const paths = [
					metadata.bundle,
					...metadata.assets.map((asset) => asset.path),
				];
				for (const [index, asset] of [
					manifest.launchAsset,
					...manifest.assets,
				].entries()) {
					const expected = archive.files.get(paths[index]);
					assert(expected);
					expect(asset.key).toBe(basename(paths[index]));
					expect(asset.hash).toBe(
						createHash("sha256").update(expected).digest("base64url"),
					);
					expect(asset.url).toMatch(
						new RegExp(`^${fixture.url}/api/v1/assets/`),
					);
					expect(new URL(asset.url).search).toBe("");
					const downloaded = await fetch(asset.url);
					expect(downloaded.status).toBe(200);
					expect(downloaded.headers.get("content-type")).toContain(
						asset.contentType,
					);
					expect(Buffer.from(await downloaded.arrayBuffer())).toEqual(expected);
				}
				const repeated = await update(runtime, platform, {
					Accept: "application/expo+json",
				});
				expect(await repeated.json()).toEqual(manifest);
				const current = await update(runtime, platform, {
					"expo-current-update-id": published.id,
				});
				expect(current.status).toBe(204);
				expect(await current.text()).toBe("");
				expect(current.headers.get("content-type")).toBeNull();
			}
			for (const platform of ["ios", "android"] as const) {
				if (!platforms.includes(platform))
					expect((await update(runtime, platform)).status).toBe(204);
			}
		},
	);

	it("isolates preview, production, and unmatched native runtimes", async () => {
		const productionId = await publish("channel-test");
		const previewId = await publish("channel-test", previewToken, "preview");
		const production = await update("channel-test", "ios", {
			Accept: "application/json",
		});
		const preview = await update(
			"channel-test",
			"ios",
			{ Accept: "application/json", "expo-channel-name": "preview" },
			"?channel=production",
		);
		expect((await production.json()).id).toBe(productionId);
		expect((await preview.json()).id).toBe(previewId);
		expect(preview.headers.get("expo-manifest-filters")).toBe(
			'channel="preview"',
		);
		const missing = await update("unpublished-runtime", "ios");
		expect(missing.status).toBe(204);
		expect(await missing.text()).toBe("");
	});

	it("rolls back only the latest update and signs the embedded rollback directive", async () => {
		const previousId = await publish("rollback-test");
		const currentId = await publish("rollback-test");
		expect((await rollback(previousId)).status).toBe(409);
		const response = await rollback(currentId);
		expect(response.status).toBe(201);
		const rolledBack: { rollbackedAt: string } = await response.json();
		const embeddedId = uuidv7();
		const directive = await update("rollback-test", "ios", {
			"expo-current-update-id": currentId,
			"expo-embedded-update-id": embeddedId,
			"expo-expect-signature": 'keyid="main"',
		});
		expect(directive.status).toBe(200);
		const contentType = directive.headers.get("content-type");
		assert(contentType);
		const boundary = contentType.split("boundary=")[1];
		const parts = (await directive.text()).split(`--${boundary}`);
		expect(parts).toHaveLength(3);
		const [headers, part] = parts[1].split("\r\n\r\n");
		expect(headers).toContain('name="directive"');
		const signature = headers
			.split("\r\n")
			.find((line) => line.startsWith("expo-signature: "));
		assert(signature);
		const body = part.slice(0, -2);
		expect(
			verify(
				"RSA-SHA256",
				Buffer.from(body),
				fixture.publicKey,
				signatureBytes(signature.slice("expo-signature: ".length)),
			),
		).toBe(true);
		expect(JSON.parse(body)).toEqual({
			type: "rollBackToEmbedded",
			parameters: { commitTime: rolledBack.rollbackedAt },
		});
		const embedded = await update("rollback-test", "ios", {
			"expo-current-update-id": embeddedId,
			"expo-embedded-update-id": embeddedId,
		});
		expect(embedded.status).toBe(204);
	});

	it("keeps one rollback timestamp when two requests wait for the same manifest", async () => {
		const manifestId = await publish("concurrent-rollback");
		const blocker = fixture.connectDatabase();
		await blocker`BEGIN`;
		await blocker`SELECT id FROM manifests WHERE id = ${manifestId} FOR UPDATE`;
		const pending = Promise.all([rollback(manifestId), rollback(manifestId)]);
		let waiting = 0;
		try {
			const deadline = Date.now() + 5_000;
			while (Date.now() < deadline) {
				const [activity] =
					await fixture.sql`SELECT count(*)::int AS count FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock' AND state = 'active' AND query ILIKE '%manifests%'`;
				waiting = activity.count;
				if (waiting === 2) break;
				await delay(25);
			}
		} finally {
			await blocker`ROLLBACK`;
			await blocker.end();
		}
		const responses = await pending;
		expect(waiting).toBe(2);
		for (const response of responses) expect(response.status).toBe(201);
		const [first, second]: { rollbackedAt: string }[] = await Promise.all(
			responses.map((response) => response.json()),
		);
		expect(second.rollbackedAt).toBe(first.rollbackedAt);
		const repeated = await rollback(manifestId);
		expect(repeated.status).toBe(201);
		expect((await repeated.json()).rollbackedAt).toBe(first.rollbackedAt);
		const [stored] =
			await fixture.sql`SELECT rollbacked_at FROM manifests WHERE id = ${manifestId}`;
		expect(new Date(`${stored.rollbacked_at}Z`).toISOString()).toBe(
			first.rollbackedAt,
		);
	});

	it("rejects tokens outside their application, channel, storage, or CDN scope", async () => {
		const archive = exportArchive(["ios"]).zip;
		const [{ count: before }] =
			await fixture.sql`SELECT count(*)::int AS count FROM manifests`;
		const crossApp = await upload(productionToken, "forbidden", archive, {
			appId: fixture.otherAppId,
		});
		expect(crossApp.status).toBe(403);
		const crossChannel = await upload(productionToken, "forbidden", archive, {
			channel: "preview",
		});
		expect(crossChannel.status).toBe(403);
		const crossProvider = await upload(productionToken, "forbidden", archive, {
			storage: {
				storage: [{ providerId: fixture.otherProviderId, cdnIds: [] }],
			},
		});
		expect(crossProvider.status).toBe(404);
		const crossCdn = await upload(productionToken, "forbidden", archive, {
			storage: {
				storage: [
					{ providerId: fixture.providerId, cdnIds: [fixture.otherCdnId] },
				],
			},
		});
		expect(crossCdn.status).toBe(404);
		const listing = await fetch(`${fixture.url}/api/v1/updates/list?size=10`, {
			headers: { Authorization: `Bearer ${productionToken}` },
		});
		expect(listing.status).toBe(403);
		const [{ count: after }] =
			await fixture.sql`SELECT count(*)::int AS count FROM manifests`;
		expect(after).toBe(before);
	});

	it("rejects expired and revoked tokens before publication", async () => {
		const expired = await token("production", new Date(Date.now() - 1_000));
		const revoked = await token();
		await fixture.sql`DELETE FROM publish_tokens WHERE token_hash = ${createHash("sha256").update(revoked).digest("hex")}`;
		for (const value of [expired, revoked]) {
			const response = await upload(
				value,
				"invalid-token",
				exportArchive(["ios"]).zip,
			);
			expect(response.status).toBe(401);
		}
		const [{ count }] =
			await fixture.sql`SELECT count(*)::int AS count FROM manifests WHERE runtime_version = 'invalid-token'`;
		expect(count).toBe(0);
	});

	it("creates and revokes working publish tokens through the operator CLI", async () => {
		const expiresAt = new Date(Date.now() + 3_600_000).toISOString();
		const result = await fixture.runTokenCommand([
			"create",
			fixture.appId,
			"production",
			expiresAt,
		]);
		expect(result.code).toBe(0);
		const created: {
			id: string;
			appId: string;
			channel: string;
			token: string;
		} = JSON.parse(result.stdout);
		expect(created.appId).toBe(fixture.appId);
		expect(created.channel).toBe("production");
		expect(/^expotes_[A-Za-z0-9_-]+$/.test(created.token)).toBe(true);
		const [stored] =
			await fixture.sql`SELECT token_hash FROM publish_tokens WHERE id = ${created.id}`;
		expect(
			stored.token_hash ===
				createHash("sha256").update(created.token).digest("hex"),
		).toBe(true);
		await publish("operator-cli", created.token);
		const revoked = await fixture.runTokenCommand(["revoke", created.id]);
		expect(revoked.code).toBe(0);
		expect(JSON.parse(revoked.stdout)).toEqual({ revoked: created.id });
		const response = await upload(
			created.token,
			"revoked-cli",
			exportArchive(["ios"]).zip,
		);
		expect(response.status).toBe(401);

		const [{ count: before }] =
			await fixture.sql`SELECT count(*)::int AS count FROM publish_tokens`;
		for (const [channel, expiry] of [
			["unknown", expiresAt],
			["production", new Date(Date.now() - 1_000).toISOString()],
			["production", "not-a-date"],
		]) {
			const invalid = await fixture.runTokenCommand([
				"create",
				fixture.appId,
				channel,
				expiry,
			]);
			expect(invalid.code).toBe(1);
			expect(invalid.stdout).toBe("");
			expect(invalid.stderr).toContain("Usage: publish-token.mjs");
		}
		const [{ count: after }] =
			await fixture.sql`SELECT count(*)::int AS count FROM publish_tokens`;
		expect(after).toBe(before);
	});

	it("rejects malformed exports without publishing a manifest", async () => {
		const response = await upload(
			productionToken,
			"malformed",
			Buffer.from("not a ZIP"),
		);
		expect(response.status).toBe(400);
		const [{ count }] =
			await fixture.sql`SELECT count(*)::int AS count FROM manifests WHERE runtime_version = 'malformed'`;
		expect(count).toBe(0);
		expect(
			(await fetch(`${fixture.url}/api/v1/assets/${uuidv7()}`)).status,
		).toBe(404);
	});
	it.each([
		{ path: "/auth/login", marker: "login-page" },
		{ path: "/app/applications", marker: "applications-page" },
	])("serves the exported dashboard route $path", async ({ path, marker }) => {
		const redirect = await fetch(`${fixture.url}${path}`, {
			redirect: "manual",
		});
		expect(redirect.status).toBe(301);
		expect(redirect.headers.get("location")).toBe(`${path}/`);
		const page = await fetch(`${fixture.url}${path}`);
		expect(page.status).toBe(200);
		expect(await page.text()).toContain(marker);
	});

	it("keeps missing API and dashboard routes as 404 responses", async () => {
		const api = await fetch(`${fixture.url}/api/v1/missing`);
		expect(api.status).toBe(404);
		expect(api.headers.get("content-type")).toContain("application/json");
		const page = await fetch(`${fixture.url}/nonexistent-dashboard-route`);
		expect(page.status).toBe(404);
	});
});
