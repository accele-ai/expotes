import crypto, { type BinaryToTextEncoding } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { Dictionary } from "structured-headers";

export function createHash(
	file: Buffer,
	hashingAlgorithm: string,
	encoding: BinaryToTextEncoding,
) {
	return crypto.createHash(hashingAlgorithm).update(file).digest(encoding);
}

export function getBase64URLEncoding(base64EncodedString: string): string {
	return base64EncodedString
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

export async function getPrivateKeyAsync() {
	const privateKeyPath = process.env.PRIVATE_KEY_PATH;
	if (!privateKeyPath) {
		return null;
	}

	const pemBuffer = await fs.readFile(path.resolve(privateKeyPath));
	return pemBuffer.toString("utf8");
}

export function signRSASHA256(data: string, privateKey: string) {
	const sign = crypto.createSign("RSA-SHA256");
	sign.update(data, "utf8");
	sign.end();
	return sign.sign(privateKey, "base64");
}
export function convertToDictionaryItemsRepresentation(obj: {
	[key: string]: string;
}): Dictionary {
	return new Map(
		Object.entries(obj).map(([k, v]) => {
			return [k, [v, new Map()]];
		}),
	);
}
