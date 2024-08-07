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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManifestController = void 0;
const common_1 = require("@nestjs/common");
const manifest_service_1 = require("./manifest.service");
const expo_updates_v1_1 = require("../../common/decorators/expo-updates-v1");
let ManifestController = class ManifestController {
    constructor(manifestService) {
        this.manifestService = manifestService;
    }
    manifest(meta) {
        return this.manifestService.endpoint(meta);
    }
};
exports.ManifestController = ManifestController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, expo_updates_v1_1.ExpoUpdatesV1)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [expo_updates_v1_1.ExpoUpdatesV1Dto]),
    __metadata("design:returntype", void 0)
], ManifestController.prototype, "manifest", null);
exports.ManifestController = ManifestController = __decorate([
    (0, common_1.Controller)('manifest'),
    __metadata("design:paramtypes", [manifest_service_1.ManifestService])
], ManifestController);
//# sourceMappingURL=manifest.controller.js.map