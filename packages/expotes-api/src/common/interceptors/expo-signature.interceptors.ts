import type {
	ManifestResponse,
	UpdateManifest,
} from "@/modules/manifest/manifest.types";
import {
	convertToDictionaryItemsRepresentation,
	getPrivateKeyAsync,
	signRSASHA256,
} from "@/shared/utils/crypto.util";
import {
	BadRequestException,
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
	NotAcceptableException,
	ServiceUnavailableException,
	StreamableFile,
} from "@nestjs/common";
import type { Request, Response } from "express";
import FormData from "form-data";
import { type Observable, mergeMap } from "rxjs";
import { parseDictionary, serializeDictionary } from "structured-headers";

async function sign(body: string, expectedSignature: string): Promise<string> {
	let expected: ReturnType<typeof parseDictionary>;
	try {
		expected = parseDictionary(expectedSignature);
	} catch {
		throw new BadRequestException("Invalid expo-expect-signature header.");
	}
	const keyId = process.env.PRIVATE_KEY_ID ?? "main";
	const requestedKeyId = expected.get("keyid")?.[0];
	const requestedAlgorithm = expected.get("alg")?.[0];
	if (
		(requestedKeyId !== undefined && requestedKeyId !== keyId) ||
		(requestedAlgorithm !== undefined &&
			requestedAlgorithm !== "rsa-v1_5-sha256")
	) {
		throw new NotAcceptableException(
			"Requested signing key or algorithm is not available.",
		);
	}

	const privateKey = await getPrivateKeyAsync();
	if (!privateKey) {
		throw new ServiceUnavailableException(
			"Code signing requires PRIVATE_KEY_PATH.",
		);
	}
	return serializeDictionary(
		convertToDictionaryItemsRepresentation({
			sig: signRSASHA256(body, privateKey),
			keyid: keyId,
			alg: "rsa-v1_5-sha256",
		}),
	);
}

@Injectable()
export class ExpoSignatureInterceptor implements NestInterceptor {
	intercept(
		context: ExecutionContext,
		next: CallHandler<ManifestResponse>,
	): Observable<UpdateManifest | StreamableFile | undefined> {
		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();
		response.setHeader("expo-protocol-version", "1");
		response.setHeader("expo-sfv-version", "0");
		response.setHeader("cache-control", "private, max-age=0");
		response.vary("Accept");
		response.vary("Expo-Platform");
		response.vary("Expo-Runtime-Version");
		response.vary("Expo-Channel-Name");

		return next.handle().pipe(
			mergeMap(async (data) => {
				response.setHeader(
					"expo-manifest-filters",
					serializeDictionary(
						convertToDictionaryItemsRepresentation({ channel: data.channel }),
					),
				);
				if (!data.manifest && !data.directive) {
					response.status(204);
					return undefined;
				}

				const contentType = request.accepts(
					data.manifest
						? ["multipart/mixed", "application/expo+json", "application/json"]
						: ["multipart/mixed"],
				);
				if (!contentType) {
					throw new NotAcceptableException(
						"The requested update response format is not supported.",
					);
				}

				const body = JSON.stringify(data.manifest ?? data.directive);
				const expectedSignature = request.get("expo-expect-signature");
				const signature = expectedSignature
					? await sign(body, expectedSignature)
					: undefined;
				response.status(200);
				if (contentType !== "multipart/mixed") {
					response.setHeader("content-type", contentType);
					if (signature) response.setHeader("expo-signature", signature);
					return data.manifest;
				}

				const form = new FormData();
				form.append(data.manifest ? "manifest" : "directive", body, {
					contentType: "application/json",
					header: signature ? { "expo-signature": signature } : undefined,
				});
				return new StreamableFile(form.getBuffer(), {
					type: `multipart/mixed; boundary=${form.getBoundary()}`,
				});
			}),
		);
	}
}
