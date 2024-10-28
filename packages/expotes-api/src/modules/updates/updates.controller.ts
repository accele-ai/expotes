import { ApiController } from "@/common/decorators/api-controller.decorator";
import { Team } from "@/common/decorators/get-owner-decorator";
import { CursorPagerDto, PagerDto } from "@/shared/dto/pager.dto";
import { ManifestsOptions } from "@db/schema";
import { TypedBody, TypedFormData, TypedQuery, TypedRoute } from "@nestia/core";
import { Body, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express } from "express";
import type {
	CreateUpdatesDto,
	FindAllUpdatesDto,
	FindAllUpdatesEntity,
} from "./updates.dto";
import { UpdatesService } from "./updates.service";

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

	@TypedRoute.Post("create")
	@UseInterceptors(FileInterceptor("file"))
	async create(
		@Body() body: CreateUpdatesDto,
		@UploadedFile() file: Express.Multer.File,
	) {
		return this.uploadService.createUpdates(
			{
				appId: body.appId,
				options: JSON.parse(body.options),
				meta: { runtimeVersion: body.runtimeVersion },
				notes: body.notes,
			},
			file,
		);
	}
}
