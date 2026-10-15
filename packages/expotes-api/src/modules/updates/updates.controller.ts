import { ApiController } from "@/common/decorators/api-controller.decorator";
import { Team } from "@/common/decorators/get-owner-decorator";
import { Publish } from "@/common/decorators/publish.decorator";
import type { ContextRequest } from "@/transformers/get-req.transformer";
import type { ManifestsOptions } from "@db/schema";
import { TypedQuery, TypedRoute } from "@nestia/core";
import { ForbiddenException, Req } from "@nestjs/common";
import {
	BadRequestException,
	Body,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express } from "express";
import { memoryStorage } from "multer";
import { MAX_UPLOAD_BYTES } from "./updates.archive";
import type {
	CreateUpdatesDto,
	FindAllUpdatesDto,
	FindAllUpdatesEntity,
} from "./updates.dto";
import { UpdatesService } from "./updates.service";

function parseOptions(raw: string | undefined): ManifestsOptions {
	if (raw === undefined) return { storage: [] };
	let options: unknown;
	try {
		options = JSON.parse(raw);
	} catch {
		throw new BadRequestException("options must contain valid JSON");
	}
	if (
		typeof options !== "object" ||
		options === null ||
		!("storage" in options) ||
		!Array.isArray(options.storage)
	) {
		throw new BadRequestException("options.storage must be an array");
	}
	return {
		storage: options.storage.map((option: unknown) => {
			if (
				typeof option !== "object" ||
				option === null ||
				!("providerId" in option) ||
				!("cdnIds" in option) ||
				typeof option.providerId !== "number" ||
				!Number.isSafeInteger(option.providerId) ||
				option.providerId <= 0 ||
				!Array.isArray(option.cdnIds) ||
				!option.cdnIds.every(
					(id: unknown) =>
						typeof id === "number" && Number.isSafeInteger(id) && id > 0,
				)
			) {
				throw new BadRequestException(
					"Storage and CDN provider IDs must be positive integers",
				);
			}
			return { providerId: option.providerId, cdnIds: option.cdnIds };
		}),
	};
}

@ApiController("updates")
export class UpdatesController {
	constructor(private readonly uploadService: UpdatesService) {}

	@TypedRoute.Get("list")
	async list(
		@TypedQuery() dto: FindAllUpdatesDto,
		@Team() teamId: string,
	): Promise<FindAllUpdatesEntity[]> {
		return this.uploadService.listUpdates({ ...dto, teamId });
	}

	@Publish()
	@TypedRoute.Post("create")
	@UseInterceptors(
		FileInterceptor("file", {
			storage: memoryStorage(),
			limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
		}),
	)
	async create(
		@Req() request: ContextRequest,
		@Body() body: CreateUpdatesDto,
		@UploadedFile() file: Express.Multer.File,
		@Team() teamId: string,
	) {
		this.verifyScope(request, body.appId, body.channel ?? "production");
		return this.uploadService.createUpdates(
			{
				appId: body.appId,
				teamId,
				channel: body.channel,
				options: parseOptions(body.options),
				meta: { runtimeVersion: body.runtimeVersion },
				notes: body.notes,
			},
			file,
		);
	}
	@Publish()
	@TypedRoute.Post("rollback")
	async rollback(
		@Req() request: ContextRequest,
		@Body() body: {
			appId: string;
			channel?: "preview" | "production";
			manifestId: string;
		},
		@Team() teamId: string,
	) {
		const channel = body.channel ?? "production";
		this.verifyScope(request, body.appId, channel);
		return this.uploadService.rollback(
			body.appId,
			teamId,
			channel,
			body.manifestId,
		);
	}

	private verifyScope(request: ContextRequest, appId: string, channel: string) {
		const scope = request.publishScope;
		if (scope && (scope.appId !== appId || scope.channel !== channel)) {
			throw new ForbiddenException(
				"Publish token does not authorize this application and channel",
			);
		}
	}
}
