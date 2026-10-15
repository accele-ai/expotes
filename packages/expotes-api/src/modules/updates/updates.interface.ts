export type UpdatePlatform = "ios" | "android";
export type UpdateChannel = "preview" | "production";

export interface ExportAsset {
	path: string;
	ext: string;
}

export interface FileMetadataContent {
	bundle: string;
	assets: ExportAsset[];
}

export interface FileMetadata {
	version: 0;
	bundler: "metro";
	fileMetadata: Partial<Record<UpdatePlatform, FileMetadataContent>>;
}
