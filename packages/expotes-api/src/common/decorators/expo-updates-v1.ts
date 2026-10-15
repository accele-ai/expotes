import type { IncomingHttpHeaders } from "node:http";
import {
	BadRequestException,
	type ExecutionContext,
	createParamDecorator,
} from "@nestjs/common";
import { Expose, plainToInstance } from "class-transformer";
import {
	IsIn,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	validate,
} from "class-validator";

export type UpdateChannel = "preview" | "production";

export class ExpoUpdatesV1HeadersDto {
	@IsIn(["0", "1"])
	@Expose({ name: "expo-protocol-version" })
	protocolVersion: "0" | "1";

	@IsIn(["ios", "android"])
	@Expose({ name: "expo-platform" })
	platform: "ios" | "android";

	@IsString()
	@IsNotEmpty()
	@Expose({ name: "expo-runtime-version" })
	runtimeVersion: string;

	@IsUUID()
	@IsOptional()
	@Expose({ name: "expo-current-update-id" })
	currentUpdateId?: string;

	@IsUUID()
	@IsOptional()
	@Expose({ name: "expo-embedded-update-id" })
	embeddedUpdateId?: string;

	@IsIn(["preview", "production"])
	channel: UpdateChannel;
}

export interface ExpoUpdatesV1Dto {
	protocolVersion: 0 | 1;
	platform: "ios" | "android";
	runtimeVersion: string;
	currentUpdateId?: string;
	embeddedUpdateId?: string;
	channel: UpdateChannel;
}

export async function parseExpoUpdatesRequest(
	headers: IncomingHttpHeaders,
	query: { channel?: unknown } = {},
): Promise<ExpoUpdatesV1Dto> {
	const input = plainToInstance(ExpoUpdatesV1HeadersDto, {
		...headers,
		channel: headers["expo-channel-name"] ?? query.channel ?? "production",
	});
	if ((await validate(input)).length > 0) {
		throw new BadRequestException(
			"Invalid Expo Updates request headers or channel.",
		);
	}

	return {
		protocolVersion: input.protocolVersion === "0" ? 0 : 1,
		platform: input.platform,
		runtimeVersion: input.runtimeVersion,
		currentUpdateId: input.currentUpdateId?.toLowerCase(),
		embeddedUpdateId: input.embeddedUpdateId?.toLowerCase(),
		channel: input.channel,
	};
}

export const ExpoUpdatesV1 = createParamDecorator(
	(_data: unknown, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest();
		return parseExpoUpdatesRequest(request.headers, request.query);
	},
);
