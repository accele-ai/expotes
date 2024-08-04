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
import { Controller, Get, Query, UsePipes, ValidationPipe, } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsQueryDto } from './assets.dto';
let AssetsController = class AssetsController {
    constructor(assetsService) {
        this.assetsService = assetsService;
    }
    getAssets(query) {
    }
};
__decorate([
    Get(),
    UsePipes(new ValidationPipe({ transform: true })),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof AssetsQueryDto !== "undefined" && AssetsQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "getAssets", null);
AssetsController = __decorate([
    Controller('assets'),
    __metadata("design:paramtypes", [typeof (_a = typeof AssetsService !== "undefined" && AssetsService) === "function" ? _a : Object])
], AssetsController);
export { AssetsController };
//# sourceMappingURL=assets.controller.js.map