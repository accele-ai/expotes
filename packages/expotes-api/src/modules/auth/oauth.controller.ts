import { Cookie } from "@/common/decorators/cookie.decorator";
import { Controller, Get, Query, Redirect, Res } from "@nestjs/common";
import { OauthService } from "./oauth.service";
import { AuthService } from "./auth.service";
import { Response } from "express";
import { SessionService } from "../session/session.service";
import { Public } from "@/common/decorators/auth.decorator";

@Controller("oauth")
export class OauthController {
	constructor(
		private readonly authService: AuthService,
		private readonly oauthService: OauthService,
		private readonly sessionService: SessionService,
	) {}

	/**
	 * @ignore
	 */
	@Public()
	@Get("github")
	@Redirect()
	async github(@Res() res: Response) {
		const url = await this.oauthService.getGithubAuthUrl(res);
		return { url };
	}

	/**
	 * @ignore
	 */
	@Public()
	@Get("github/callback")
	async githubCallback(
		@Query("state") state: string,
		@Query("code") code: string,
		@Cookie("github_oauth_state") stateCookie: string,
		@Res() res: Response,
	) {
		const userId = await this.oauthService.githubCallback(
			state,
			code,
			stateCookie,
		);
		return this.authService.signToken(
			res,
			await this.sessionService.create(userId),
		);
	}
}
