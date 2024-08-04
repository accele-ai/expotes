import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import fs from 'fs/promises';
import * as Minio from 'minio';

interface UploadProps {
  key: string;
  data: Buffer;
  bucket?: string;
  extras?: Partial<{
    ContentType: string;
  }>;
}

const DEFAULT_BUCKET = 'expotes';

@Injectable()
export class StorageService {
  private minio: Minio.Client;

  constructor() {
    this.minio = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT) : 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: 'minioadmin',
      secretKey: 'minioadmin',
    });
  }

  private async checkBucket(bucket: string) {
    const exists = await this.minio.bucketExists(bucket);
    if (!exists) {
      await this.minio.makeBucket(bucket);
    }
  }

  private async upload({ key, data, bucket, extras }: UploadProps) {
    try {
      await this.minio.putObject(
        bucket ?? DEFAULT_BUCKET,
        key,
        data,
        undefined,
        extras,
      );
    } catch (error) {
      await this.checkBucket(bucket);

      throw new ServiceUnavailableException(error);
    }
  }

  async uploadLocalFile({
    path,
    ...props
  }: Omit<UploadProps, 'data'> & { path: string }) {
    const data = await fs.readFile(path);
    await this.upload({ data, ...props });
  }
}
