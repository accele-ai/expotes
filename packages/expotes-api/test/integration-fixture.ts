import assert from "node:assert/strict";
import { type ChildProcess, spawn } from "node:child_process";
import { generateKeyPairSync, randomBytes, randomInt } from "node:crypto";
import { type WriteStream, createWriteStream } from "node:fs";
import {
	copyFile,
	mkdir,
	mkdtemp,
	readFile,
	rm,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { types } from "node:util";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import Redis from "ioredis";
import { Client } from "minio";
import postgres, { type Sql } from "postgres";
import { v7 as uuidv7 } from "uuid";

function required(name: string): string {
	const value = process.env[name];
	if (!value)
		throw new Error(`Set ${name} to a dedicated integration-test service`);
	return value;
}

export class IntegrationFixture {
	readonly teamId = uuidv7();
	readonly otherTeamId = uuidv7();
	readonly appId = uuidv7();
	readonly otherAppId = uuidv7();
	readonly legacyManifestId = uuidv7();
	readonly legacyAssetId = uuidv7();
	readonly providerId = randomInt(100_000, 1_000_000_000);
	readonly otherProviderId = this.providerId + 1;
	readonly cdnId = this.providerId;
	readonly otherCdnId = this.providerId + 1;
	readonly url = `http://127.0.0.1:${process.env.E2E_PORT ?? "59010"}`;
	readonly buckets: string[] = [];
	publicKey = "";
	sql!: Sql;
	private admin?: Sql;
	private redis?: Redis;
	private minio?: Client;
	private server?: ChildProcess;
	private log?: WriteStream;
	private directory?: string;
	private databaseUrl = "";
	private databaseCreated = false;
	private ready = false;
	private database = `expotes_e2e_${randomBytes(6).toString("hex")}`;

	async start() {
		const adminUrl = required("E2E_DATABASE_URL");
		const redisUrl = required("E2E_REDIS_URL");
		const endpoint = required("E2E_S3_ENDPOINT");
		const port = Number(required("E2E_S3_PORT"));
		const accessKey = required("E2E_S3_ACCESS_KEY");
		const secretKey = required("E2E_S3_SECRET_KEY");
		const useSSL = process.env.E2E_S3_USE_SSL === "true";
		const apiDirectory = resolve(__dirname, "..");
		this.directory = await mkdtemp(join(tmpdir(), "expotes-e2e-"));
		const dashboardPath = join(this.directory, "dashboard");
		for (const [route, page] of Object.entries({
			"": "home-page",
			"auth/login": "login-page",
			"app/applications": "applications-page",
		})) {
			const pageDirectory = join(dashboardPath, route);
			await mkdir(pageDirectory, { recursive: true });
			await writeFile(
				join(pageDirectory, "index.html"),
				`<!doctype html><html><body>${page}</body></html>`,
			);
		}
		this.admin = postgres(adminUrl, { max: 1 });
		await this.admin`CREATE DATABASE ${this.admin(this.database)}`;
		this.databaseCreated = true;
		const databaseUrl = new URL(adminUrl);
		databaseUrl.pathname = `/${this.database}`;
		this.databaseUrl = databaseUrl.toString();
		this.sql = postgres(databaseUrl.toString(), { max: 1, onnotice: () => {} });
		await this.migrateLegacyDatabase(apiDirectory);

		this.minio = new Client({
			endPoint: endpoint,
			port,
			useSSL,
			accessKey,
			secretKey,
		});
		for (const suffix of ["default", "provider"]) {
			const bucket = `${this.database.replaceAll("_", "-")}-${suffix}`;
			await this.minio.makeBucket(bucket, "us-east-1");
			this.buckets.push(bucket);
		}
		await this.sql`
			INSERT INTO storage_provider
			(id, team_id, type, name, access_key, secret_key, endpoint, bucket, region, extras)
			VALUES
			(${this.providerId}, ${this.teamId}, 'minio', 'e2e-provider', ${accessKey}, ${secretKey}, ${endpoint}, ${this.buckets[1]}, 'us-east-1', ${JSON.stringify({ port, useSSL })}::jsonb),
			(${this.otherProviderId}, ${this.otherTeamId}, 'minio', 'e2e-other', ${accessKey}, ${secretKey}, ${endpoint}, ${this.buckets[1]}, 'us-east-1', ${JSON.stringify({ port, useSSL })}::jsonb)`;
		await this.sql`
			INSERT INTO cdn_provider (id, team_id, type, name, host, origin, options)
			VALUES
			(${this.cdnId}, ${this.teamId}, 'tencent-cdn', 'signed-e2e', 'unused.invalid', 'unused.invalid', '{"type":"A","key":"test-signing-key","key2":""}'),
			(${this.otherCdnId}, ${this.otherTeamId}, 'tencent-cdn', 'other-e2e', 'unused.invalid', 'unused.invalid', '{"type":null,"key":"","key2":""}')`;
		this.redis = new Redis(redisUrl);
		await this.redis.ping();

		const keys = generateKeyPairSync("rsa", {
			modulusLength: 2048,
			publicKeyEncoding: { type: "spki", format: "pem" },
			privateKeyEncoding: { type: "pkcs8", format: "pem" },
		});
		this.publicKey = keys.publicKey;
		const privateKeyPath = join(this.directory, "private.pem");
		await writeFile(privateKeyPath, keys.privateKey, { mode: 0o600 });
		const logPath = join(this.directory, "api.log");
		this.log = createWriteStream(logPath, { mode: 0o600 });
		this.server = spawn(
			process.execPath,
			["--experimental-require-module", "dist/src/main.js"],
			{
				cwd: apiDirectory,
				env: {
					...process.env,
					NODE_ENV: "production",
					DATABASE_URL: databaseUrl.toString(),
					REDIS_URL: redisUrl,
					API_URL: this.url,
					PORT: new URL(this.url).port,
					S3_ENDPOINT: endpoint,
					S3_PORT: String(port),
					S3_USE_SSL: String(useSSL),
					S3_ACCESS_KEY: accessKey,
					S3_SECRET_KEY: secretKey,
					S3_BUCKET: this.buckets[0],
					PRIVATE_KEY_PATH: privateKeyPath,
					PRIVATE_KEY_ID: "main",
					PROD_STATIC_PATH: dashboardPath,
					GITHUB_CLIENT_ID: "integration-test",
					GITHUB_CLIENT_SECRET: "integration-test",
				},
				stdio: ["ignore", "pipe", "pipe"],
			},
		);
		this.server.stdout?.pipe(this.log);
		this.server.stderr?.pipe(this.log);
		const deadline = Date.now() + 30_000;
		while (Date.now() < deadline) {
			if (this.server.exitCode !== null)
				throw new Error(
					`API exited with ${this.server.exitCode}; inspect ${logPath}`,
				);
			try {
				const response = await fetch(
					`${this.url}/api/v1/manifest/${this.appId}`,
					{
						headers: {
							"expo-protocol-version": "1",
							"expo-platform": "ios",
							"expo-runtime-version": "startup-check",
						},
					},
				);
				if (response.status !== 204)
					throw new Error(
						`API readiness returned ${response.status}; inspect ${logPath}`,
					);
				this.ready = true;
				return;
			} catch (error) {
				if (
					!types.isNativeError(error) ||
					!types.isNativeError(error.cause) ||
					!("code" in error.cause) ||
					error.cause.code !== "ECONNREFUSED"
				)
					throw error;
			}
			await delay(100);
		}
		throw new Error(`API startup timed out; inspect ${logPath}`);
	}

	private async migrateLegacyDatabase(apiDirectory: string) {
		const migrations = join(apiDirectory, "db/migrations");
		assert(this.directory);
		const legacyDirectory = join(this.directory, "legacy-migrations");
		await mkdir(join(legacyDirectory, "meta"), { recursive: true });
		const journal: { entries: { idx: number; tag: string }[] } = JSON.parse(
			await readFile(join(migrations, "meta/_journal.json"), "utf8"),
		);
		journal.entries = journal.entries.filter((entry) => entry.idx < 3);
		await writeFile(
			join(legacyDirectory, "meta/_journal.json"),
			JSON.stringify(journal),
		);
		for (const entry of journal.entries)
			await copyFile(
				join(migrations, `${entry.tag}.sql`),
				join(legacyDirectory, `${entry.tag}.sql`),
			);
		await migrate(drizzle(this.sql), { migrationsFolder: legacyDirectory });
		await this
			.sql`INSERT INTO teams (id, name, handle) VALUES (${this.teamId}, 'E2E', 'e2e'), (${this.otherTeamId}, 'Other E2E', 'other-e2e')`;
		await this
			.sql`INSERT INTO applications (id, team_id, name, handle) VALUES (${this.appId}, ${this.teamId}, 'E2E app', 'e2e-app'), (${this.otherAppId}, ${this.otherTeamId}, 'Other app', 'other-app')`;
		await this
			.sql`INSERT INTO manifests (id, app_id, runtime_version, created_at) VALUES (${this.legacyManifestId}, ${this.appId}, 'legacy', now())`;
		await this
			.sql`INSERT INTO assets (id, manifest_id, path, content_type) VALUES (${this.legacyAssetId}, ${this.legacyManifestId}, '/old/assets/metro-legacy-key', 'image/png')`;
		await migrate(drizzle(this.sql), { migrationsFolder: migrations });
	}

	connectDatabase(): Sql {
		return postgres(this.databaseUrl, { max: 1 });
	}

	async runTokenCommand(
		args: string[],
	): Promise<{ code: number | null; stdout: string; stderr: string }> {
		assert(this.databaseUrl);
		const child = spawn(
			process.execPath,
			["scripts/publish-token.mjs", ...args],
			{
				cwd: resolve(__dirname, ".."),
				env: { DATABASE_URL: this.databaseUrl },
				stdio: ["ignore", "pipe", "pipe"],
				signal: AbortSignal.timeout(10_000),
			},
		);
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (chunk: Buffer) => {
			stdout += chunk.toString();
		});
		child.stderr.on("data", (chunk: Buffer) => {
			stderr += chunk.toString();
		});
		return new Promise((resolveExit, reject) => {
			child.once("error", reject);
			child.once("close", (code) => resolveExit({ code, stdout, stderr }));
		});
	}

	async stop() {
		if (this.server && this.server.exitCode === null) {
			const server = this.server;
			await new Promise<void>((resolveExit) => {
				const timeout = setTimeout(() => server.kill("SIGKILL"), 5_000);
				server.once("exit", () => {
					clearTimeout(timeout);
					resolveExit();
				});
				server.kill("SIGTERM");
			});
		}
		this.log?.end();
		if (this.redis) {
			await this.redis.del(
				`cache:storage_provider:${this.providerId}`,
				`cache:storage_provider:${this.otherProviderId}`,
			);
			await this.redis.quit();
		}
		if (this.minio) {
			for (const bucket of this.buckets) {
				for await (const object of this.minio.listObjectsV2(bucket, "", true))
					if (object.name) await this.minio.removeObject(bucket, object.name);
				await this.minio.removeBucket(bucket);
			}
		}
		if (this.sql) await this.sql.end();
		if (this.admin) {
			if (this.databaseCreated)
				await this
					.admin`DROP DATABASE ${this.admin(this.database)} WITH (FORCE)`;
			await this.admin.end();
		}
		if (this.directory) {
			if (this.ready)
				await rm(this.directory, { recursive: true, force: true });
			else await rm(join(this.directory, "private.pem"), { force: true });
		}
	}
}
