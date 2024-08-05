import { getNestExecutionContextRequest } from '@/transformers/get-req.transformer';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from '@/modules/session/session.service';
import { SESSION_COOKIE_NAME } from '@/constants/cache.constant';
import { JWEService } from '@/processors/helper/jwe.service';
import { Reflector } from '@nestjs/core';

/* JWE 中的 Payload */
export interface TokenPayload {
  token: string;
}

/**
 * Auth guard (both JWE and session token
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(SessionService)
    protected readonly sessionService: SessionService,
    @Inject(JWEService)
    protected readonly jweService: JWEService<TokenPayload>,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const isOptional = this.reflector.getAllAndOverride<boolean>(
      'isOptionalAuth',
      [context.getHandler(), context.getClass()],
    );

    const request = this.getRequest(context);
    const cookies = request.cookies;
    const headers = request.headers;

    const Authorization = headers.authorization || headers.Authorization;
    let sessionId = cookies[SESSION_COOKIE_NAME];

    if (!Authorization && !sessionId) {
      if (isOptional) {
        return true;
      }
      throw new BadRequestException('未登录');
    }

    if (Authorization) {
      // 从 Authorization 中提取 JWT
      const jwt = (
        Array.isArray(Authorization) ? Authorization[0] : Authorization
      ).replace(/[Bb]earer /, '');
      if (!jwt) {
        if (isOptional) {
          return true;
        }
        throw new UnauthorizedException('令牌无效');
      }
      // 解密 JWT
      const { token} = await this.jweService.decrypt(jwt);

      if (token) {
        sessionId = token;
      }
    }

    if (!sessionId) {
      if (isOptional) {
        return true;
      }
      throw new UnauthorizedException('令牌无效');
    }

    const session = await this.sessionService.find(sessionId);
    if (session) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (session.extra === '[object Object]') {
      }
      request.owner = session;
      // patch

      return true;
    }

    if (isOptional) {
      return true;
    }
    throw new UnauthorizedException('令牌无效');
  }

  getRequest(context: ExecutionContext) {
    return getNestExecutionContextRequest(context);
  }
}
