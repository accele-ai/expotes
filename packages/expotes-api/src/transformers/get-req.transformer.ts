import { Request } from 'express';
import { ExecutionContext } from '@nestjs/common';
import { ISessionPayload } from '@/modules/session/session.dto';

export interface ContextRequest extends Request, Record<string, any> {
  owner?: ISessionPayload;
  teamId?: string;
}
/*
 * Auth guard will set the user in the context
 * We can use this function to get the user from the context
 */
export function getNestExecutionContextRequest(
  context: ExecutionContext,
): ContextRequest {
  return context.switchToHttp().getRequest<Request>();
}
