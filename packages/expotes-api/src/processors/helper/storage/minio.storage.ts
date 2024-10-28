import { StreamableFile, ServiceUnavailableException } from "@nestjs/common";
import * as Minio from "minio";
import {
	AbstractObjectStorage,
	UploadProps,
	UploadLocalFileProps,
	UploadBufferProps,
} from "./abstract.storage";

export interface MinioStorageProps {
	endpoint: string;
	port: number;
	useSSL: boolean;
	accessKey: string;
	secretKey: string;
	bucket: string;
	region?: string;
	prefix?: string;
}

export const DEFAULT_MINIO_PROPS: MinioStorageProps = {
	endpoint: process.env.MINIO_ENDPOINT || "localhost",
	port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT) : 9000,
	useSSL: process.env.MINIO_USE_SSL === "true",
	accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
	secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
	bucket: process.env.MINIO_BUCKET || "expotes",
};

export class MinioStorage extends AbstractObjectStorage {
	private minio: Minio.Client;
	// private prefix = '';

	constructor({
		endpoint,
		port,
		useSSL,
		accessKey,
		secretKey,
		bucket,
		region,
	}: // prefix,
	MinioStorageProps) {
		super(bucket);
		this.minio = new Minio.Client({
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
			await this.minio.putObject(
				bucket || this.bucket,
				key,
				data,
				undefined,
				extras,
			);
		} catch (error) {
			await this.checkBucket(bucket || this.bucket);
			throw new ServiceUnavailableException(error);
		}
	}

	async uploadLocalFile({
		path,
		key,
		bucket,
	}: UploadLocalFileProps): Promise<void> {
		try {
			await this.minio.fPutObject(bucket || this.bucket, key, path);
		} catch (error) {
			await this.checkBucket(bucket || this.bucket);
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
			const stream = await this.minio.getObject(bucket || this.bucket, key);
			return new StreamableFile(stream);
		} catch (error) {
			throw new ServiceUnavailableException(error);
		}
	}

	async delete(key: string, bucket?: string): Promise<void> {
		try {
			await this.minio.removeObject(bucket || this.bucket, key);
		} catch (error) {
			throw new ServiceUnavailableException(error);
		}
	}

	async list(prefix: string, bucket?: string): Promise<string[]> {
		const objectsList: string[] = [];
		const stream = this.minio.listObjects(bucket || this.bucket, prefix, true);

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
			await this.minio.statObject(bucket || this.bucket, key);
			return true;
		} catch (error) {
			if (error.code === "NotFound") {
				return false;
			}
			throw new ServiceUnavailableException(error);
		}
	}

	protected async checkBucket(bucket: string): Promise<void> {
		const exists = await this.minio.bucketExists(bucket);
		if (!exists) {
			await this.minio.makeBucket(bucket);
		}
	}

	async signUrl(key: string, bucket?: string): Promise<string> {
		const expiry = 60 * 60 * 24; // 24 hours
		return this.minio.presignedGetObject(bucket || this.bucket, key, expiry);
	}
}
