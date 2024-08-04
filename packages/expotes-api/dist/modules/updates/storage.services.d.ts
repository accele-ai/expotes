interface UploadProps {
    key: string;
    data: Buffer;
    bucket?: string;
    extras?: Partial<{
        ContentType: string;
    }>;
}
export declare class StorageService {
    private minio;
    constructor();
    private checkBucket;
    private upload;
    uploadLocalFile({ path, ...props }: Omit<UploadProps, 'data'> & {
        path: string;
    }): Promise<void>;
}
export {};
