"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpoUpdatesV1 = exports.ExpoUpdatesV1Dto = exports.ExpoUpdatesV1QueryDto = exports.ExpoUpdatesV1HeadersDto = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const class_validator_2 = require("class-validator");
class ExpoUpdatesV1HeadersDto {
}
exports.ExpoUpdatesV1HeadersDto = ExpoUpdatesV1HeadersDto;
__decorate([
    (0, class_validator_1.IsNumberString)(),
    (0, class_validator_2.IsIn)(['0', '1'], {
        message: 'Unsupported protocol version. Expected either 0 or 1.',
    }),
    (0, class_transformer_1.Expose)({ name: 'expo-protocol-version' }),
    __metadata("design:type", String)
], ExpoUpdatesV1HeadersDto.prototype, "protocolVersion", void 0);
__decorate([
    (0, class_validator_2.IsString)(),
    (0, class_validator_2.IsIn)(['ios', 'android'], {
        message: 'Unsupported platform. Expected either ios or android.',
    }),
    (0, class_validator_2.IsOptional)(),
    (0, class_transformer_1.Expose)({ name: 'expo-platform' }),
    __metadata("design:type", String)
], ExpoUpdatesV1HeadersDto.prototype, "platform", void 0);
__decorate([
    (0, class_validator_1.IsNumberString)(),
    (0, class_validator_2.IsOptional)(),
    (0, class_transformer_1.Expose)({ name: 'expo-runtime-version' }),
    __metadata("design:type", String)
], ExpoUpdatesV1HeadersDto.prototype, "runtimeVersion", void 0);
__decorate([
    (0, class_validator_2.IsString)(),
    (0, class_validator_2.IsOptional)(),
    (0, class_transformer_1.Expose)({ name: 'expo-current-update-id' }),
    __metadata("design:type", String)
], ExpoUpdatesV1HeadersDto.prototype, "currentUpdateId", void 0);
__decorate([
    (0, class_validator_2.IsString)(),
    (0, class_validator_2.IsOptional)(),
    (0, class_transformer_1.Expose)({ name: 'expo-embedded-update-id' }),
    __metadata("design:type", String)
], ExpoUpdatesV1HeadersDto.prototype, "embeddedUpdateId", void 0);
class ExpoUpdatesV1QueryDto {
}
exports.ExpoUpdatesV1QueryDto = ExpoUpdatesV1QueryDto;
__decorate([
    (0, class_validator_2.IsString)(),
    (0, class_validator_2.IsIn)(['ios', 'android'], {
        message: 'Unsupported platform. Expected either ios or android.',
    }),
    (0, class_validator_2.IsOptional)(),
    __metadata("design:type", String)
], ExpoUpdatesV1QueryDto.prototype, "platform", void 0);
__decorate([
    (0, class_validator_2.IsString)(),
    (0, class_validator_2.IsOptional)(),
    (0, class_transformer_1.Expose)({ name: 'runtime-version' }),
    __metadata("design:type", String)
], ExpoUpdatesV1QueryDto.prototype, "runtimeVersion", void 0);
class ExpoUpdatesV1Dto {
}
exports.ExpoUpdatesV1Dto = ExpoUpdatesV1Dto;
exports.ExpoUpdatesV1 = (0, common_1.createParamDecorator)(async (data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const headers = request.headers;
    const headersDto = (0, class_transformer_1.plainToInstance)(ExpoUpdatesV1HeadersDto, headers);
    const errors = await (0, class_validator_1.validate)(headersDto);
    if (errors.length > 0) {
        throw new common_1.BadRequestException('Invalid headers');
    }
    return {
        protocolVersion: headersDto['expo-protocol-version'],
        platform: headers['expo-platform'],
        runtimeVersion: headers['expo-runtime-version'],
    };
});
//# sourceMappingURL=expo-updates-v1.js.map