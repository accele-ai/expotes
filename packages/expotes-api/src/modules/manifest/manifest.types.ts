import type { UpdateChannel } from "@/common/decorators/expo-updates-v1";

export interface UpdateAsset {
	hash?: string;
	key: string;
	contentType: string;
	fileExtension?: string;
	url: string;
}

export interface UpdateManifest {
	id: string;
	createdAt: string;
	runtimeVersion: string;
	launchAsset: UpdateAsset;
	assets: UpdateAsset[];
	metadata: Record<string, string>;
	extra: Record<string, unknown>;
}

export interface RollbackDirective {
	type: "rollBackToEmbedded";
	parameters: { commitTime: string };
}

export interface ManifestResponse {
	channel: UpdateChannel;
	manifest?: UpdateManifest;
	directive?: RollbackDirective;
}
