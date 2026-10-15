import * as path from "node:path";
import { BadRequestException } from "@nestjs/common";
import AdmZip from "adm-zip";
import type {
	FileMetadata,
	FileMetadataContent,
	UpdatePlatform,
} from "./updates.interface";

export const MAX_UPLOAD_BYTES = 256 * 1024 * 1024;
const MAX_EXTRACTED_BYTES = 512 * 1024 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exportPath(value: unknown): string {
	if (
		typeof value !== "string" ||
		value.length === 0 ||
		value.includes("\\") ||
		value.includes("\0") ||
		path.posix.isAbsolute(value) ||
		/^[A-Za-z]:/.test(value) ||
		value
			.split("/")
			.some((part) => part === ".." || part === "." || part === "")
	) {
		throw new BadRequestException(
			"Export paths must be relative paths without traversal segments",
		);
	}
	return value;
}

function parseMetadata(value: unknown): FileMetadata {
	if (
		!isRecord(value) ||
		value.version !== 0 ||
		value.bundler !== "metro" ||
		!isRecord(value.fileMetadata)
	) {
		throw new BadRequestException(
			"metadata.json must contain an Expo Metro export with version 0",
		);
	}
	const fileMetadata: FileMetadata["fileMetadata"] = {};
	for (const platform of ["ios", "android"] as const) {
		const entry = value.fileMetadata[platform];
		if (entry === undefined) continue;
		if (!isRecord(entry) || !Array.isArray(entry.assets)) {
			throw new BadRequestException(`Invalid ${platform} export metadata`);
		}
		fileMetadata[platform] = {
			bundle: exportPath(entry.bundle),
			assets: entry.assets.map((asset: unknown) => {
				if (
					!isRecord(asset) ||
					typeof asset.ext !== "string" ||
					!/^[a-zA-Z0-9]+$/.test(asset.ext)
				) {
					throw new BadRequestException(`Invalid ${platform} asset metadata`);
				}
				return { path: exportPath(asset.path), ext: asset.ext };
			}),
		};
	}
	if (!fileMetadata.ios && !fileMetadata.android) {
		throw new BadRequestException(
			"The export must contain an iOS or Android bundle",
		);
	}
	return { version: 0, bundler: "metro", fileMetadata };
}

export class UpdateArchive {
	private readonly files = new Map<string, AdmZip.IZipEntry>();
	readonly platforms: Partial<Record<UpdatePlatform, FileMetadataContent>>;

	constructor(buffer: Buffer) {
		if (buffer.length === 0 || buffer.length > MAX_UPLOAD_BYTES) {
			throw new BadRequestException(
				"The update ZIP must contain 1 byte to 256 MiB",
			);
		}
		let entries: AdmZip.IZipEntry[];
		try {
			entries = new AdmZip(buffer).getEntries();
		} catch {
			throw new BadRequestException(
				"The update file must be a valid ZIP archive",
			);
		}
		let expandedSize = 0;
		for (const entry of entries) {
			exportPath(
				entry.isDirectory ? entry.entryName.slice(0, -1) : entry.entryName,
			);
			expandedSize += entry.header.size;
			if (expandedSize > MAX_EXTRACTED_BYTES) {
				throw new BadRequestException(
					"The expanded update ZIP must not exceed 512 MiB",
				);
			}
			if (entry.isDirectory) continue;
			if (this.files.has(entry.entryName)) {
				throw new BadRequestException(
					`Duplicate ZIP entry: ${entry.entryName}`,
				);
			}
			this.files.set(entry.entryName, entry);
		}
		let metadata: unknown;
		try {
			metadata = JSON.parse(this.readFile("metadata.json").toString("utf8"));
		} catch (error) {
			if (!(error instanceof SyntaxError)) throw error;
			throw new BadRequestException("metadata.json must contain valid JSON");
		}
		this.platforms = parseMetadata(metadata).fileMetadata;
		for (const platform of Object.values(this.platforms)) {
			this.requireFile(platform.bundle);
			for (const asset of platform.assets) this.requireFile(asset.path);
		}
	}

	private requireFile(filePath: string): AdmZip.IZipEntry {
		const entry = this.files.get(filePath);
		if (!entry)
			throw new BadRequestException(`Missing export file: ${filePath}`);
		return entry;
	}

	readFile(filePath: string): Buffer {
		try {
			return this.requireFile(filePath).getData();
		} catch (error) {
			if (error instanceof BadRequestException) throw error;
			throw new BadRequestException(`Cannot read ZIP entry: ${filePath}`);
		}
	}
}
