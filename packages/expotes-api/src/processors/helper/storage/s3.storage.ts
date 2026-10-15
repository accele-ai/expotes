import { ServiceUnavailableException, StreamableFile } from "@nestjs/common";
import * as Minio from "minio";
import {
	AbstractObjectStorage,
	UploadBufferProps,
	UploadLocalFileProps,
	UploadProps,
} from "./abstract.storage";

export interface S3StorageProps {
	endpoint: string;
	port?: number;
	useSSL?: boolean;
	accessKey: string;
	secretKey: string;
	bucket: string;
	region?: string;
}

export function readDefaultS3Config(
	env: NodeJS.ProcessEnv = process.env,
): S3StorageProps {
	const accessKey = env.S3_ACCESS_KEY ?? env.MINIO_ACCESS_KEY;
	const secretKey = env.S3_SECRET_KEY ?? env.MINIO_SECRET_KEY;
	if (!accessKey || !secretKey) {
		throw new Error("S3_ACCESS_KEY and S3_SECRET_KEY must be set");
	}

	const port = Number(env.S3_PORT ?? env.MINIO_PORT ?? "9000");
	if (!Number.isInteger(port) || port < 0 || port > 65535) {
		throw new Error("S3_PORT must be an integer between 0 and 65535");
	}

	const useSSL = env.S3_USE_SSL ?? env.MINIO_USE_SSL ?? "false";
	if (useSSL !== "true" && useSSL !== "false") {
		throw new Error("S3_USE_SSL must be true or false");
	}

	return {
		endpoint: env.S3_ENDPOINT ?? env.MINIO_ENDPOINT ?? "localhost",
		port,
		useSSL: useSSL === "true",
		accessKey,
		secretKey,
		bucket: env.S3_BUCKET ?? env.MINIO_BUCKET ?? "expotes",
		region: env.S3_REGION ?? env.MINIO_REGION,
	};
}

export class S3Storage extends AbstractObjectStorage {
	private readonly client: Minio.Client;

	constructor({
		endpoint,
		port,
		useSSL,
		accessKey,
		secretKey,
		bucket,
		region,
	}: S3StorageProps) {
		super(bucket);
		this.client = new Minio.Client({
			endPoint: endpoint,
			port,
			useSSL,
			accessKey,
			secretKey,
			region,
		});
	}

	async upload({ key, data, bucket, extras }: UploadProps): Promise<void> {
		try {
			await this.client.putObject(
				bucket || this.bucket,
				key,
				data,
				undefined,
				extras,
			);
		} catch (error) {
			throw new ServiceUnavailableException(error);
		}
	}

	async uploadLocalFile({
		path,
		key,
		bucket,
	}: UploadLocalFileProps): Promise<void> {
		try {
			await this.client.fPutObject(bucket || this.bucket, key, path);
		} catch (error) {
			throw new ServiceUnavailableException(error);
		}
	}

	async uploadBuffer({
		key,
		buffer,
		bucket,
		extras,
	}: UploadBufferProps): Promise<void> {
		await this.upload({ key, data: buffer, bucket, extras });
	}

	async download(key: string, bucket?: string): Promise<StreamableFile> {
		try {
			const stream = await this.client.getObject(bucket || this.bucket, key);
			return new StreamableFile(stream);
		} catch (error) {
			throw new ServiceUnavailableException(error);
		}
	}

	async delete(key: string, bucket?: string): Promise<void> {
		try {
			await this.client.removeObject(bucket || this.bucket, key);
		} catch (error) {
			throw new ServiceUnavailableException(error);
		}
	}

	async list(prefix: string, bucket?: string): Promise<string[]> {
		const objectsList: string[] = [];
		const stream = this.client.listObjects(bucket || this.bucket, prefix, true);

		return new Promise((resolve, reject) => {
			stream.on("data", (obj) => {
				if (obj.name) {
					objectsList.push(obj.name);
				}
			});
			stream.on("error", reject);
			stream.on("end", () => resolve(objectsList));
		});
	}

	async exists(key: string, bucket?: string): Promise<boolean> {
		try {
			await this.client.statObject(bucket || this.bucket, key);
			return true;
		} catch (error) {
			if (error.code === "NotFound") {
				return false;
			}
			throw new ServiceUnavailableException(error);
		}
	}

	async signUrl(key: string, bucket?: string): Promise<string> {
		const expiry = 60 * 60 * 24; // 24 hours
		return this.client.presignedGetObject(bucket || this.bucket, key, expiry);
	}
}
