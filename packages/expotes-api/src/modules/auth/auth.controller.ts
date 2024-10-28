import { Body, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { TypedRoute } from "@nestia/core";
import { CreateUserDto, LoginUserDto } from "./auth.dto";

import { Public } from "@/common/decorators/auth.decorator";
import { Owner } from "@/common/decorators/get-owner-decorator";
import { ISessionPayload } from "@/modules/session/session.dto";
import { Response } from "express";
import { ApiController } from "@/common/decorators/api-controller.decorator";

@ApiController("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@TypedRoute.Post("/login")
	async login(
		@Body() dto: LoginUserDto,
		@Res({ passthrough: true }) response: Response,
	) {
		const result = await this.authService.login(dto);
		return this.authService.signToken(response, result);
	}

	@Public()
	@TypedRoute.Post("/register")
	async register(
		@Body() dto: CreateUserDto,
		@Res({ passthrough: true }) response: Response,
	) {
		const result = await this.authService.register(dto);
		return this.authService.signToken(response, result);
	}

	@TypedRoute.Post("/logout")
	async logout(@Owner() owner: ISessionPayload) {
		return this.authService.logoutOne(owner.userId, owner.sessionId);
	}
}
