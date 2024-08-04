interface Asset {
    path: string;
    ext: string;
}
interface FileMetadataContent {
    bundle: string;
    assets: Asset[];
}
export interface FileMetadata {
    version: number;
    bundler: string;
    fileMetadata: {
        android: FileMetadataContent;
        ios: FileMetadataContent;
    };
}
export {};
