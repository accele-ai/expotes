var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsIn, IsNotEmpty } from 'class-validator';
export class ManifestQueryDto {
}
__decorate([
    IsString(),
    IsNotEmpty({ message: 'No runtimeVersion provided.' }),
    __metadata("design:type", String)
], ManifestQueryDto.prototype, "runtime-version", void 0);
__decorate([
    IsIn(['ios', 'android'], {
        message: 'Unsupported platform. Expected either ios or android.',
    }),
    __metadata("design:type", String)
], ManifestQueryDto.prototype, "platform", void 0);
//# sourceMappingURL=manifest.dto.js.map