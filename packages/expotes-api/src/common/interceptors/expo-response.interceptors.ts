import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

export class ExpoResponseHeaderInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const response = context.switchToHttp().getResponse();
    response.setHeader('expo-protocol-version', 1);
    response.setHeader('expo-sfv-version', 0);
    response.setHeader('cache-control', 'private, max-age=0');
    return next.handle();
  }
}
