import type { CacheService } from "@/processors/cache/cache.service";
import type { DatabaseService } from "@/processors/database/database.service";
import { Client } from "minio";
import { S3Storage, readDefaultS3Config } from "./s3.storage";
import { StorageService } from "./storage.services";

jest.mock("minio", () => ({ Client: jest.fn() }));

const credentials = {
	S3_ACCESS_KEY: "rustfs-access-key",
	S3_SECRET_KEY: "rustfs-secret-key",
};

const provider = {
	id: 7,
	name: "RustFS storage",
	teamId: "a4fd22eb-8828-4b82-9c2a-d1400f2ec059",
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
	prefix: "",
	type: "minio" as const,
	bucket: "project-updates",
	accessKey: "project-access-key",
	secretKey: "project-secret-key",
	endpoint: "rustfs.internal",
	region: "us-east-1",
	extras: { port: 9000, useSSL: false },
};

function setup() {
	return new StorageService({} as DatabaseService, {} as CacheService);
}

describe("Default S3 configuration", () => {
	it("uses local RustFS defaults with explicit credentials", () => {
		expect(readDefaultS3Config(credentials)).toEqual({
			endpoint: "localhost",
			port: 9000,
			useSSL: false,
			accessKey: credentials.S3_ACCESS_KEY,
			secretKey: credentials.S3_SECRET_KEY,
			bucket: "expotes",
			region: undefined,
		});
	});

	it("prefers every S3 setting over its legacy MINIO setting", () => {
		expect(
			readDefaultS3Config({
				...credentials,
				S3_ENDPOINT: "rustfs.internal",
				S3_PORT: "0",
				S3_USE_SSL: "false",
				S3_BUCKET: "rustfs-updates",
				S3_REGION: "us-east-1",
				MINIO_ENDPOINT: "old-storage.internal",
				MINIO_PORT: "9443",
				MINIO_USE_SSL: "true",
				MINIO_ACCESS_KEY: "old-access-key",
				MINIO_SECRET_KEY: "old-secret-key",
				MINIO_BUCKET: "old-updates",
				MINIO_REGION: "old-region",
			}),
		).toEqual({
			endpoint: "rustfs.internal",
			port: 0,
			useSSL: false,
			accessKey: credentials.S3_ACCESS_KEY,
			secretKey: credentials.S3_SECRET_KEY,
			bucket: "rustfs-updates",
			region: "us-east-1",
		});
	});

	it("keeps existing MINIO deployments configurable", () => {
		expect(
			readDefaultS3Config({
				MINIO_ENDPOINT: "existing-storage.internal",
				MINIO_PORT: "9443",
				MINIO_USE_SSL: "true",
				MINIO_ACCESS_KEY: "existing-access-key",
				MINIO_SECRET_KEY: "existing-secret-key",
				MINIO_BUCKET: "existing-updates",
				MINIO_REGION: "us-east-1",
			}),
		).toEqual({
			endpoint: "existing-storage.internal",
			port: 9443,
			useSSL: true,
			accessKey: "existing-access-key",
			secretKey: "existing-secret-key",
			bucket: "existing-updates",
			region: "us-east-1",
		});
	});

	it.each([
		{},
		{ S3_ACCESS_KEY: credentials.S3_ACCESS_KEY },
		{ S3_SECRET_KEY: credentials.S3_SECRET_KEY },
		{ ...credentials, S3_ACCESS_KEY: "", MINIO_ACCESS_KEY: "legacy-key" },
	])(
		"rejects missing credentials instead of selecting anonymous access",
		(env) => {
			expect(() => readDefaultS3Config(env)).toThrow(
				"S3_ACCESS_KEY and S3_SECRET_KEY must be set",
			);
		},
	);

	it.each(["not-a-port", "9000oops", "9000.5", "-1", "65536"])(
		"rejects invalid port %s",
		(port) => {
			expect(() =>
				readDefaultS3Config({ ...credentials, S3_PORT: port }),
			).toThrow("S3_PORT must be an integer between 0 and 65535");
		},
	);

	it("rejects a misspelled TLS flag", () => {
		expect(() =>
			readDefaultS3Config({ ...credentials, S3_USE_SSL: "ture" }),
		).toThrow("S3_USE_SSL must be true or false");
	});
});

describe("S3 storage provider selection", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.replaceProperty(process, "env", credentials);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("reads default configuration when the service starts, after module imports", async () => {
		const service = setup();
		expect(await service.getStorage()).toBeInstanceOf(S3Storage);
		expect(Client).toHaveBeenCalledWith(
			expect.objectContaining({
				accessKey: credentials.S3_ACCESS_KEY,
				secretKey: credentials.S3_SECRET_KEY,
			}),
		);
	});

	it.each(["s3", "minio"] as const)(
		"uses the S3 client for provider type %s",
		async (type) => {
			const service = setup();
			jest
				.spyOn(service, "fetchStorage")
				.mockResolvedValue({ ...provider, type });
			expect(await service.getStorage(7)).toBeInstanceOf(S3Storage);
			expect(service.fetchStorage).toHaveBeenCalledWith(7);
			expect(Client).toHaveBeenLastCalledWith({
				endPoint: "rustfs.internal",
				port: 9000,
				useSSL: false,
				accessKey: "project-access-key",
				secretKey: "project-secret-key",
				region: "us-east-1",
			});
		},
	);
	it.each([
		{ extras: {}, origin: "https://rustfs.internal" },
		{ extras: { useSSL: false }, origin: "http://rustfs.internal" },
		{ extras: { port: 9443 }, origin: "https://rustfs.internal:9443" },
	])(
		"preserves SDK connection defaults for legacy extras $extras",
		async ({ extras, origin }) => {
			const service = setup();
			const { Client: ActualClient } =
				jest.requireActual<typeof import("minio")>("minio");
			jest
				.mocked(Client)
				.mockImplementationOnce((options) => new ActualClient(options));
			jest
				.spyOn(service, "fetchStorage")
				.mockResolvedValue({ ...provider, extras });
			const storage = await service.getStorage(provider.id);
			expect(new URL(await storage.signUrl("asset")).origin).toBe(origin);
		},
	);
});
