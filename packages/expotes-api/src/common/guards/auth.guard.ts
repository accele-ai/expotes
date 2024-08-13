import {
  ContextRequest,
  getNestExecutionContextRequest,
} from '@/transformers/get-req.transformer';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from '@/modules/session/session.service';
import { SESSION_COOKIE_NAME } from '@/constants/cache.constant';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(SessionService)
    protected readonly sessionService: SessionService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublicAuth', [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = this.getRequest(context);
    const cookies = request.cookies;
    const headers = request.headers;

    const isSessionValid = await this.verifySession(isPublic, request, cookies);

    const teamId = headers['expotes-team-id'];
    if (teamId) {
      const isUserInTeam = await this.sessionService.verifyUserTeam(
        request.owner!.userId,
        teamId,
      );
      if (isUserInTeam) {
        request.teamId = teamId;
      } else {
        throw new ForbiddenException('用户不在团队中');
      }
    }
    return isSessionValid;
  }

  async verifySession(
    isPublic: boolean,
    request: ContextRequest,
    cookies: Record<string, string>,
  ) {
    const sessionId = cookies[SESSION_COOKIE_NAME];
    if (sessionId) {
      const session = await this.sessionService.find(sessionId);

      if (session) {
        request.owner = session;

        return true;
      } else if (isPublic) {
        return true;
      }
    } else if (isPublic) {
      return true;
    } else {
      throw new ForbiddenException('未登录');
    }

    throw new UnauthorizedException('令牌无效');
  }

  getRequest(context: ExecutionContext) {
    return getNestExecutionContextRequest(context);
  }
}
