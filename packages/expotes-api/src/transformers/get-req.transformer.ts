import type { PublishScope } from "@/modules/session/publish-token.service";
import { ISessionPayload } from "@/modules/session/session.dto";
import { ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export interface ContextRequest extends Request {
	owner?: ISessionPayload;
	teamId?: string;
	publishScope?: PublishScope;
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
