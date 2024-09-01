import { StreamableFile } from '@nestjs/common';

export interface UploadProps {
  key: string;
  data: Buffer;
  bucket?: string;
  extras?: Partial<{
    ContentType: string;
  }>;
}

export interface UploadPropsWithBucket extends UploadProps {
  bucket: string;
}

export interface UploadLocalFileProps extends Omit<UploadProps, 'data'> {
  path: string;
}

export interface UploadLocalFilePropsWithBucket
  extends Omit<UploadLocalFileProps, 'data'> {
  path: string;
}

export interface UploadBufferProps extends Omit<UploadProps, 'data'> {
  buffer: Buffer;
}

export interface UploadBufferPropsWithBucket
  extends Omit<UploadBufferProps, 'data'> {
  buffer: Buffer;
}

export abstract class AbstractObjectStorage {
  constructor(protected readonly bucket: string) {}

  protected abstract checkBucket(bucket: string): Promise<void>;

  abstract upload(props: UploadProps): Promise<void>;
  abstract upload(props: UploadPropsWithBucket): Promise<void>;

  abstract uploadLocalFile(props: UploadLocalFileProps): Promise<void>;
  abstract uploadLocalFile(
    props: UploadLocalFilePropsWithBucket,
  ): Promise<void>;

  abstract uploadBuffer(props: UploadBufferProps): Promise<void>;
  abstract uploadBuffer(props: UploadBufferPropsWithBucket): Promise<void>;

  abstract download(key: string, bucket?: string): Promise<StreamableFile>;

  abstract delete(key: string, bucket?: string): Promise<void>;

  abstract list(prefix: string, bucket?: string): Promise<string[]>;

  abstract exists(key: string, bucket?: string): Promise<boolean>;

  abstract signUrl(key: string, bucket?: string): Promise<string>;
}
