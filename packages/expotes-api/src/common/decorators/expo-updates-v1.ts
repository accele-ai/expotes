import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Expose, plainToInstance } from 'class-transformer';
import { IsNumberString, validate } from 'class-validator';

import { IsString, IsIn, IsOptional } from 'class-validator';

export class ExpoUpdatesV1HeadersDto {
  @IsNumberString()
  @IsIn(['0', '1'], {
    message: 'Unsupported protocol version. Expected either 0 or 1.',
  })
  @Expose({ name: 'expo-protocol-version' })
  protocolVersion: string;

  @IsString()
  @IsIn(['ios', 'android'], {
    message: 'Unsupported platform. Expected either ios or android.',
  })
  @IsOptional()
  @Expose({ name: 'expo-platform' })
  platform: string;

  @IsNumberString()
  @IsOptional()
  @Expose({ name: 'expo-runtime-version' })
  runtimeVersion: string;

  @IsString()
  @IsOptional()
  @Expose({ name: 'expo-current-update-id' })
  currentUpdateId: string;

  @IsString()
  @IsOptional()
  @Expose({ name: 'expo-embedded-update-id' })
  embeddedUpdateId: string;
}

export class ExpoUpdatesV1QueryDto {
  @IsString()
  @IsIn(['ios', 'android'], {
    message: 'Unsupported platform. Expected either ios or android.',
  })
  @IsOptional()
  platform: string;

  @IsString()
  @IsOptional()
  @Expose({ name: 'runtime-version' })
  runtimeVersion: string;
}

export class ExpoUpdatesV1Dto {
  protocolVersion: 0 | 1;
  platform: 'ios' | 'android';
  runtimeVersion: number;
  currentUpdateId: string;
  embeddedUpdateId?: string;
}

export const ExpoUpdatesV1 = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const headers = request.headers;

    const headersDto = plainToInstance(ExpoUpdatesV1HeadersDto, headers);
    const errors = await validate(headersDto);

    if (errors.length > 0) {
      throw new BadRequestException('Invalid headers');
    }

    return {
      protocolVersion: headersDto.protocolVersion,
      platform: headers.platform,
      runtimeVersion: headers.runtimeVersion,
    };
  },
);
