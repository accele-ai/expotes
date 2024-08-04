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
var _a;
import { Controller, Post, UploadedFile, UseInterceptors, } from '@nestjs/common';
import { UpdatesService } from './updates.service';
import { FileInterceptor } from '@nestjs/platform-express';
let UpdatesController = class UpdatesController {
    constructor(uploadService) {
        this.uploadService = uploadService;
    }
    async uploadFile(file) {
        return this.uploadService.createUpdates({
            appId: '866eebb7-35fc-45b0-b31e-b94a470a2580',
            meta: { runtimeVersion: 1 },
        }, file);
    }
};
__decorate([
    Post(),
    UseInterceptors(FileInterceptor('file')),
    __param(0, UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UpdatesController.prototype, "uploadFile", null);
UpdatesController = __decorate([
    Controller('updates'),
    __metadata("design:paramtypes", [typeof (_a = typeof UpdatesService !== "undefined" && UpdatesService) === "function" ? _a : Object])
], UpdatesController);
export { UpdatesController };
//# sourceMappingURL=updates.controller.js.map