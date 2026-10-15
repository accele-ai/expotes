import { ISessionPayload } from "@/modules/session/session.dto";
import { getNestExecutionContextRequest } from "@/transformers/get-req.transformer";
import {
	ExecutionContext,
	ForbiddenException,
	createParamDecorator,
} from "@nestjs/common";

export const Owner = createParamDecorator(
	(key: keyof ISessionPayload | undefined, ctx: ExecutionContext) => {
		const owner = getNestExecutionContextRequest(ctx)?.owner;
		if (key) return owner?.[key];
		return owner;
	},
);

export const Team = createParamDecorator(
	(_key: "id" | undefined, ctx: ExecutionContext) => {
		const teamId = getNestExecutionContextRequest(ctx)?.teamId;
		if (!teamId)
			throw new ForbiddenException("An authorized expotes-team-id is required");
		return teamId;
	},
);
