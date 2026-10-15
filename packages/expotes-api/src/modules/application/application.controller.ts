import { ApiController } from "@/common/decorators/api-controller.decorator";
import { Owner, Team } from "@/common/decorators/get-owner-decorator";
import { TypedQuery, TypedRoute } from "@nestia/core";
import { Body } from "@nestjs/common";
import { CreateApplicationDto } from "./application.dto";
import { ApplicationService } from "./application.service";

@ApiController("application")
export class ApplicationController {
	constructor(private readonly applicationService: ApplicationService) {}

	@TypedRoute.Post("create")
	async create(@Body() body: CreateApplicationDto, @Team() teamId: string) {
		return await this.applicationService.create(body, teamId);
	}

	@TypedRoute.Get("list")
	async list(
		@TypedQuery() { teamId }: { teamId: string },
		@Owner("userId") userId: string,
	) {
		return await this.applicationService.findAll(teamId, userId);
	}
}
