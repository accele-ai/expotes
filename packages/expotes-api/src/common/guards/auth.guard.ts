import { getNestExecutionContextRequest } from '@/transformers/get-req.transformer';
import {
  CanActivate,
  ExecutionContext,
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
    }

    throw new UnauthorizedException('令牌无效');
  }

  getRequest(context: ExecutionContext) {
    return getNestExecutionContextRequest(context);
  }
}
