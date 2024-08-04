var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
import { Controller, Get } from '@nestjs/common';
import { ManifestService } from './manifest.service';
import { ExpoUpdatesV1, ExpoUpdatesV1Dto, } from "../../common/decorators/expo-updates-v1";
let ManifestController = class ManifestController {
    constructor(manifestService) {
        this.manifestService = manifestService;
    }
    manifest(meta) {
        return this.manifestService.endpoint(meta);
    }
};
__decorate([
    Get(),
    __param(0, ExpoUpdatesV1()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof ExpoUpdatesV1Dto !== "undefined" && ExpoUpdatesV1Dto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ManifestController.prototype, "manifest", null);
ManifestController = __decorate([
    Controller('manifest'),
    __metadata("design:paramtypes", [typeof (_a = typeof ManifestService !== "undefined" && ManifestService) === "function" ? _a : Object])
], ManifestController);
export { ManifestController };
//# sourceMappingURL=manifest.controller.js.map