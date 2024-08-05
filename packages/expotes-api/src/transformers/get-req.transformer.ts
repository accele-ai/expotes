import { FastifyRequest } from 'fastify';

import { ExecutionContext } from '@nestjs/common';
import { ISessionPayload } from '@/modules/session/session.dto';

/*
 * Auth guard will set the user in the context
 * We can use this function to get the user from the context
 */
export function getNestExecutionContextRequest(
  context: ExecutionContext,
): FastifyRequest & { owner?: ISessionPayload } & Record<string, any> {
  return context.switchToHttp().getRequest<FastifyRequest>();
}
