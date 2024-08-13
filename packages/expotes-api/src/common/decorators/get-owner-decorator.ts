import { getNestExecutionContextRequest } from '@/transformers/get-req.transformer';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ISessionPayload } from '@/modules/session/session.dto';

export const Owner = createParamDecorator(
  (key: keyof ISessionPayload | undefined, ctx: ExecutionContext) => {
    const owner = getNestExecutionContextRequest(ctx)?.owner;
    if (key) return owner?.[key];
    return owner;
  },
);

export const Team = createParamDecorator(
  (key: 'id' | undefined, ctx: ExecutionContext) => {
    const teamId = getNestExecutionContextRequest(ctx)?.teamId;
    return teamId;
  },
);
