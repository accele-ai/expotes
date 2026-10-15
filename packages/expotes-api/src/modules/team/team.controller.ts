import { ApiController } from "@/common/decorators/api-controller.decorator";
import { Owner } from "@/common/decorators/get-owner-decorator";
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
} from "@nestjs/common";
import {
	Add2TeamDTO,
	CreateTeamDto,
	TeamFindAllDto,
	UpdateTeamDto,
} from "./team.dto";
import { TeamService } from "./team.service";

@ApiController("team")
export class TeamController {
	constructor(private readonly teamService: TeamService) {}

	@Get("/list")
	async list(@Owner("userId") userId: string) {
		return this.teamService.findAllByUser(userId);
	}

	@Post("/create")
	async create(
		@Owner("userId") userId: string,
		@Body() dto: Omit<CreateTeamDto, "userId">,
	) {
		return this.teamService.create({ ...dto, userId });
	}

	@Put("/update")
	async update(@Body() dto: UpdateTeamDto, @Owner("userId") userId: string) {
		return this.teamService.update(dto, userId);
	}

	@Post("/add-member")
	async addMember(@Body() dto: Add2TeamDTO, @Owner("userId") userId: string) {
		return this.teamService.addMember(dto, userId);
	}

	@Delete("/delete/:id")
	async delete(@Param("id") id: string, @Owner("userId") userId: string) {
		return this.teamService.delete(id, userId);
	}
}
