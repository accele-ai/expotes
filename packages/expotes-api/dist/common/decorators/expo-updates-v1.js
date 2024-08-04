var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { createParamDecorator, BadRequestException, } from '@nestjs/common';
import { Expose, plainToInstance } from 'class-transformer';
import { IsNumberString, validate } from 'class-validator';
import { IsString, IsIn, IsOptional } from 'class-validator';
export class ExpoUpdatesV1HeadersDto {
}
__decorate([
    IsNumberString(),
    IsIn(['0', '1'], {
        message: 'Unsupported protocol version. Expected either 0 or 1.',
    }),
    Expose({ name: 'expo-protocol-version' }),
    __metadata("design:type", String)
], ExpoUpdatesV1HeadersDto.prototype, "protocolVersion", void 0);
__decorate([
    IsString(),
    IsIn(['ios', 'android'], {
        message: 'Unsupported platform. Expected either ios or android.',
    }),
    IsOptional(),
    Expose({ name: 'expo-platform' }),
    __metadata("design:type", String)
], ExpoUpdatesV1HeadersDto.prototype, "platform", void 0);
__decorate([
    IsNumberString(),
    IsOptional(),
    Expose({ name: 'expo-runtime-version' }),
    __metadata("design:type", String)
], ExpoUpdatesV1HeadersDto.prototype, "runtimeVersion", void 0);
__decorate([
    IsString(),
    IsOptional(),
    Expose({ name: 'expo-current-update-id' }),
    __metadata("design:type", String)
], ExpoUpdatesV1HeadersDto.prototype, "currentUpdateId", void 0);
__decorate([
    IsString(),
    IsOptional(),
    Expose({ name: 'expo-embedded-update-id' }),
    __metadata("design:type", String)
], ExpoUpdatesV1HeadersDto.prototype, "embeddedUpdateId", void 0);
export class ExpoUpdatesV1QueryDto {
}
__decorate([
    IsString(),
    IsIn(['ios', 'android'], {
        message: 'Unsupported platform. Expected either ios or android.',
    }),
    IsOptional(),
    __metadata("design:type", String)
], ExpoUpdatesV1QueryDto.prototype, "platform", void 0);
__decorate([
    IsString(),
    IsOptional(),
    Expose({ name: 'runtime-version' }),
    __metadata("design:type", String)
], ExpoUpdatesV1QueryDto.prototype, "runtimeVersion", void 0);
export class ExpoUpdatesV1Dto {
}
export const ExpoUpdatesV1 = createParamDecorator(async (data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const headers = request.headers;
    const headersDto = plainToInstance(ExpoUpdatesV1HeadersDto, headers);
    const errors = await validate(headersDto);
    if (errors.length > 0) {
        throw new BadRequestException('Invalid headers');
    }
    return {
        protocolVersion: headersDto['expo-protocol-version'],
        platform: headers['expo-platform'],
        runtimeVersion: headers['expo-runtime-version'],
    };
});
//# sourceMappingURL=expo-updates-v1.js.map