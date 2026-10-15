import { BadRequestException } from "@nestjs/common";
import AdmZip from "adm-zip";
import { UpdateArchive } from "./updates.archive";

function zip(metadata: unknown, files: Record<string, string> = {}) {
	const archive = new AdmZip();
	archive.addFile("metadata.json", Buffer.from(JSON.stringify(metadata)));
	for (const [name, body] of Object.entries(files))
		archive.addFile(name, Buffer.from(body));
	return archive.toBuffer();
}

function metadata(bundle: string, assets: unknown[] = []) {
	return {
		version: 0,
		bundler: "metro",
		fileMetadata: { ios: { bundle, assets } },
	};
}

describe("Expo export archive validation", () => {
	it("reads a single-platform SDK 57 metadata export without creating files", () => {
		const archive = new UpdateArchive(
			zip(
				metadata("_expo/static/js/ios/app.hbc", [
					{ path: "assets/metro-hash", ext: "png" },
				]),
				{
					"_expo/static/js/ios/app.hbc": "bundle",
					"assets/metro-hash": "image",
				},
			),
		);
		expect(archive.platforms.android).toBeUndefined();
		expect(archive.readFile("assets/metro-hash").toString()).toBe("image");
	});

	it.each([
		"../outside",
		"/absolute",
		"C:/absolute",
		"assets/../../outside",
		"assets/./outside",
		"assets//outside",
		"assets\\outside",
	])("rejects unsafe metadata paths: %s", (bundle) => {
		expect(() => new UpdateArchive(zip(metadata(bundle)))).toThrow(
			BadRequestException,
		);
	});

	it("rejects an unsafe ZIP entry even when metadata does not reference the entry", () => {
		const buffer = zip(metadata("bundle"), {
			bundle: "bundle",
			"bad/escape": "payload",
		});
		const malicious = Buffer.from(buffer);
		let index = malicious.indexOf("bad/escape");
		while (index !== -1) {
			malicious.write("../escape!", index);
			index = malicious.indexOf("bad/escape", index + 10);
		}
		expect(() => new UpdateArchive(malicious)).toThrow(BadRequestException);
	});

	it.each([
		{ version: 1, bundler: "metro", fileMetadata: {} },
		{ version: 0, bundler: "metro", fileMetadata: {} },
		{
			version: 0,
			bundler: "metro",
			fileMetadata: { ios: { bundle: "bundle", assets: null } },
		},
		metadata("bundle", [{ path: "assets/hash", ext: "../png" }]),
	])("rejects unsupported or malformed metadata", (value) => {
		expect(() => new UpdateArchive(zip(value))).toThrow(BadRequestException);
	});

	it("rejects missing files before upload", () => {
		expect(() => new UpdateArchive(zip(metadata("missing")))).toThrow(
			"Missing export file: missing",
		);
	});

	it("rejects a corrupt ZIP and invalid metadata JSON", () => {
		expect(() => new UpdateArchive(Buffer.from("not a zip"))).toThrow(
			BadRequestException,
		);
		const archive = new AdmZip();
		archive.addFile("metadata.json", Buffer.from("{"));
		expect(() => new UpdateArchive(archive.toBuffer())).toThrow(
			"metadata.json must contain valid JSON",
		);
	});
});
