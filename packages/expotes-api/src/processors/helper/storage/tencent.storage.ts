import { Readable } from "node:stream";
import {
	Injectable,
	ServiceUnavailableException,
	StreamableFile,
} from "@nestjs/common";
import COS from "cos-nodejs-sdk-v5";
import {
	AbstractObjectStorage,
	UploadBufferProps,
	UploadBufferPropsWithBucket,
	UploadLocalFileProps,
	UploadLocalFilePropsWithBucket,
	UploadProps,
	UploadPropsWithBucket,
} from "./abstract.storage";

export interface TencentCosStorageProps {
	secretId: string;
	secretKey: string;
	region: string;
	bucket: string;
}

@Injectable()
export class TencentCosStorage extends AbstractObjectStorage {
	private cos: COS;
	private REGION = "ap-guangzhou";

	constructor({ secretId, secretKey, region, bucket }: TencentCosStorageProps) {
		super(bucket);
		this.cos = new COS({
			SecretId: secretId,
			SecretKey: secretKey,
		});
		if (region) {
			this.REGION = region;
		}
	}

	async upload(props: UploadProps): Promise<void>;
	async upload(props: UploadPropsWithBucket): Promise<void>;
	async upload({
		key,
		data,
		bucket,
		extras,
	}: UploadProps | UploadPropsWithBucket): Promise<void> {
		try {
			await this.cos.putObject({
				Bucket: bucket || this.bucket,
				Region: this.REGION,
				Key: key,
				Body: data,
				...extras,
			});
		} catch (error) {
			throw new ServiceUnavailableException(error);
		}
	}

	async uploadLocalFile(props: UploadLocalFileProps): Promise<void>;
	async uploadLocalFile(props: UploadLocalFilePropsWithBucket): Promise<void>;
	async uploadLocalFile({
		path,
		key,
		bucket,
		extras,
	}: UploadLocalFileProps | UploadLocalFilePropsWithBucket): Promise<void> {
		try {
			await this.cos.uploadFile({
				Bucket: bucket || this.bucket,
				Region: this.REGION,
				Key: key,
				FilePath: path,
				ContentType: extras?.ContentType,
			});
		} catch (error) {
			throw new ServiceUnavailableException(error);
		}
	}

	async uploadBuffer(props: UploadBufferProps): Promise<void>;
	async uploadBuffer(props: UploadBufferPropsWithBucket): Promise<void>;
	async uploadBuffer({
		key,
		buffer,
		bucket,
		extras,
	}: UploadBufferProps | UploadBufferPropsWithBucket): Promise<void> {
		await this.upload({ key, data: buffer, bucket, extras });
	}

	async download(key: string, bucket?: string): Promise<StreamableFile> {
		try {
			const result = await this.cos.getObject({
				Bucket: bucket || this.bucket,
				Region: this.REGION,
				Key: key,
			});
			return new StreamableFile(Readable.from(result.Body as Buffer));
		} catch (error) {
			throw new ServiceUnavailableException(error);
		}
	}

	async delete(key: string, bucket?: string): Promise<void> {
		try {
			await this.cos.deleteObject({
				Bucket: bucket || this.bucket,
				Region: this.REGION,
				Key: key,
			});
		} catch (error) {
			throw new ServiceUnavailableException(error);
		}
	}

	async list(prefix: string, bucket?: string): Promise<string[]> {
		try {
			const result = await this.cos.getBucket({
				Bucket: bucket || this.bucket,
				Region: this.REGION,
				Prefix: prefix,
			});
			return result.Contents.map((item) => item.Key);
		} catch (error) {
			throw new ServiceUnavailableException(error);
		}
	}

	async exists(key: string, bucket?: string): Promise<boolean> {
		try {
			await this.cos.headObject({
				Bucket: bucket || this.bucket,
				Region: this.REGION,
				Key: key,
			});
			return true;
		} catch (error) {
			if (error.statusCode === 404) {
				return false;
			}
			throw new ServiceUnavailableException(error);
		}
	}

	async signUrl(key: string, bucket?: string): Promise<string> {
		const expiry = 60 * 60 * 24; // 24 hours
		return this.cos.getObjectUrl(
			{
				Bucket: bucket || this.bucket,
				Region: this.REGION,
				Key: key,
				Expires: expiry,
			},
			() => {},
		);
	}
}
