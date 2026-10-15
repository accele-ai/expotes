import { SESSION_COOKIE_NAME } from "@/constants/cache.constant";
import { PublishTokenService } from "@/modules/session/publish-token.service";
import { SessionService } from "@/modules/session/session.service";
import { getNestExecutionContextRequest } from "@/transformers/get-req.transformer";
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { isUUID } from "class-validator";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly sessionService: SessionService,
		private readonly reflector: Reflector,
		private readonly publishTokens: PublishTokenService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const targets = [context.getHandler(), context.getClass()];
		const request = getNestExecutionContextRequest(context);
		const authorization = request.headers.authorization;
		if (authorization) {
			if (
				!this.reflector.getAllAndOverride<boolean>("allowPublishToken", targets)
			) {
				throw new ForbiddenException(
					"Publish tokens cannot access this endpoint",
				);
			}
			const match = /^Bearer (\S+)$/.exec(authorization);
			if (!match)
				throw new UnauthorizedException("Expected a Bearer publish token");
			request.publishScope = await this.publishTokens.verify(match[1]);
			request.teamId = request.publishScope.teamId;
			return true;
		}

		const sessionId = request.cookies?.[SESSION_COOKIE_NAME];
		const session = sessionId
			? await this.sessionService.find(sessionId)
			: null;
		if (!session) {
			if (this.reflector.getAllAndOverride<boolean>("isPublicAuth", targets))
				return true;
			throw new UnauthorizedException("A valid session is required");
		}
		request.owner = session;
		const teamId = request.headers["expotes-team-id"];
		if (teamId !== undefined) {
			if (
				typeof teamId !== "string" ||
				!isUUID(teamId) ||
				!(await this.sessionService.verifyUserTeam(session.userId, teamId))
			) {
				throw new ForbiddenException("The session cannot access this team");
			}
			request.teamId = teamId;
		}
		return true;
	}
}
