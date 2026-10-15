import assert from "node:assert/strict";
import { generateKeyPairSync, verify } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ManifestResponse } from "@/modules/manifest/manifest.types";
import {
	Controller,
	Get,
	type INestApplication,
	UseInterceptors,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { parseDictionary } from "structured-headers";
import request from "supertest";
import { ExpoSignatureInterceptor } from "./expo-signature.interceptors";

let result: ManifestResponse;
@Controller()
class UpdateController {
	@Get()
	@UseInterceptors(ExpoSignatureInterceptor)
	getUpdate() {
		return result;
	}
}

function rawBody(
	response: request.Response,
	done: (error: Error | null, body?: string) => void,
) {
	const chunks: Buffer[] = [];
	response.on("data", (chunk: Buffer) => {
		chunks.push(chunk);
	});
	response.on("end", () => done(null, Buffer.concat(chunks).toString("utf8")));
	response.on("error", done);
}

const manifest: NonNullable<ManifestResponse["manifest"]> = {
	id: "0192ed27-9c91-7cf6-a1dc-03a224b60e9c",
	createdAt: "2026-10-15T00:00:00.000Z",
	runtimeVersion: "fingerprint",
	launchAsset: {
		key: "bundle",
		contentType: "application/javascript",
		url: "https://updates.example/bundle",
		hash: "hash",
	},
	assets: [],
	metadata: { channel: "production" },
	extra: {},
};

describe("Expo Updates HTTP responses", () => {
	let app: INestApplication;
	let keyDirectory: string;
	let publicKey: string;

	beforeAll(async () => {
		const keys = generateKeyPairSync("rsa", {
			modulusLength: 2048,
			publicKeyEncoding: { type: "spki", format: "pem" },
			privateKeyEncoding: { type: "pkcs8", format: "pem" },
		});
		publicKey = keys.publicKey;
		keyDirectory = await mkdtemp(join(tmpdir(), "expotes-signature-"));
		await writeFile(join(keyDirectory, "private.pem"), keys.privateKey, {
			mode: 0o600,
		});
		const module = await Test.createTestingModule({
			controllers: [UpdateController],
		}).compile();
		app = module.createNestApplication();
		await app.init();
	});
	beforeEach(() => {
		jest.replaceProperty(process, "env", {
			...process.env,
			PRIVATE_KEY_PATH: join(keyDirectory, "private.pem"),
			PRIVATE_KEY_ID: "main",
		});
		result = { channel: "production", manifest };
	});
	afterEach(() => jest.restoreAllMocks());
	afterAll(async () => {
		await app.close();
		await rm(keyDirectory, { recursive: true, force: true });
	});

	it.each(["manifest", "directive"] as const)(
		"signs the exact multipart %s bytes",
		async (partName) => {
			if (partName === "directive")
				result = {
					channel: "production",
					directive: {
						type: "rollBackToEmbedded",
						parameters: { commitTime: "2026-10-15T01:00:00.000Z" },
					},
				};
			const response = await request(app.getHttpServer())
				.get("/")
				.set("Accept", "multipart/mixed")
				.set(
					"expo-expect-signature",
					'sig, keyid="main", alg="rsa-v1_5-sha256"',
				)
				.buffer(true)
				.parse(rawBody)
				.expect(200);
			expect(response.headers["expo-protocol-version"]).toBe("1");
			expect(response.headers["cache-control"]).toBe("private, max-age=0");
			const boundary = response.headers["content-type"].split("boundary=")[1];
			const parts = (response.body as string).split(`--${boundary}`);
			expect(parts).toHaveLength(3);
			const [partHeaders, partBody] = parts[1].split("\r\n\r\n");
			expect(partHeaders).toContain(`name="${partName}"`);
			expect(partHeaders).toContain("Content-Type: application/json");
			const signatureHeader = partHeaders
				.split("\r\n")
				.find((line) => line.startsWith("expo-signature: "));
			assert(signatureHeader, "Multipart response must include a signature");
			const signature = parseDictionary(
				signatureHeader.slice("expo-signature: ".length),
			).get("sig")?.[0];
			const body = partBody.slice(0, -2);
			expect(JSON.parse(body)).toEqual(result[partName]);
			expect(
				verify(
					"RSA-SHA256",
					Buffer.from(body),
					publicKey,
					Buffer.from(String(signature), "base64"),
				),
			).toBe(true);
			expect(
				verify(
					"RSA-SHA256",
					Buffer.from(`${body} `),
					publicKey,
					Buffer.from(String(signature), "base64"),
				),
			).toBe(false);
		},
	);

	it.each(["multipart/mixed", "application/json"])(
		"returns a bodyless 204 for Accept %s when no update is available",
		async (accept) => {
			result = { channel: "production" };
			const response = await request(app.getHttpServer())
				.get("/")
				.set("Accept", accept)
				.expect(204);
			expect(response.text).toBe("");
			expect(response.headers["content-type"]).toBeUndefined();
			expect(response.headers["expo-manifest-filters"]).toBe(
				'channel="production"',
			);
		},
	);

	it("negotiates and signs a JSON manifest", async () => {
		const response = await request(app.getHttpServer())
			.get("/")
			.set("Accept", "application/json")
			.set("expo-expect-signature", 'keyid="main"')
			.buffer(true)
			.parse(rawBody)
			.expect(200);
		expect(JSON.parse(response.body)).toEqual(manifest);
		const signature = parseDictionary(response.headers["expo-signature"]).get(
			"sig",
		)?.[0];
		expect(
			verify(
				"RSA-SHA256",
				Buffer.from(response.body),
				publicKey,
				Buffer.from(String(signature), "base64"),
			),
		).toBe(true);
	});

	it("selects multipart for a directive even when JSON has a higher preference", async () => {
		result = {
			channel: "production",
			directive: {
				type: "rollBackToEmbedded",
				parameters: { commitTime: "2026-10-15T01:00:00.000Z" },
			},
		};
		const response = await request(app.getHttpServer())
			.get("/")
			.set("Accept", "application/json;q=1, multipart/mixed;q=0.8")
			.expect(200);
		expect(response.headers["content-type"]).toMatch(/^multipart\/mixed;/);
	});

	it("rejects JSON-only requests when a rollback directive is required", async () => {
		result = {
			channel: "production",
			directive: {
				type: "rollBackToEmbedded",
				parameters: { commitTime: "2026-10-15T01:00:00.000Z" },
			},
		};
		await request(app.getHttpServer())
			.get("/")
			.set("Accept", "application/json")
			.expect(406);
	});

	it("propagates missing signing configuration without serving unsigned content", async () => {
		process.env.PRIVATE_KEY_PATH = "";
		await request(app.getHttpServer())
			.get("/")
			.set("expo-expect-signature", 'keyid="main"')
			.expect(503);
	});

	it("rejects a malformed signature request", async () => {
		await request(app.getHttpServer())
			.get("/")
			.set("expo-expect-signature", 'keyid="unterminated')
			.expect(400);
	});

	it.each(['keyid="other"', 'alg="unknown"'])(
		"rejects unsupported signing requests %s",
		async (header) => {
			await request(app.getHttpServer())
				.get("/")
				.set("expo-expect-signature", header)
				.expect(406);
		},
	);
});
