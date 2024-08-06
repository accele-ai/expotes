"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatesModule = void 0;
const common_1 = require("@nestjs/common");
const updates_service_1 = require("./updates.service");
const updates_controller_1 = require("./updates.controller");
const storage_services_1 = require("./storage.services");
const manifest_module_1 = require("../manifest/manifest.module");
const assets_module_1 = require("../assets/assets.module");
let UpdatesModule = class UpdatesModule {
};
exports.UpdatesModule = UpdatesModule;
exports.UpdatesModule = UpdatesModule = __decorate([
    (0, common_1.Module)({
        imports: [manifest_module_1.ManifestModule, assets_module_1.AssetsModule],
        controllers: [updates_controller_1.UpdatesController],
        providers: [updates_service_1.UpdatesService, storage_services_1.StorageService],
        exports: [storage_services_1.StorageService],
    })
], UpdatesModule);
//# sourceMappingURL=updates.module.js.map