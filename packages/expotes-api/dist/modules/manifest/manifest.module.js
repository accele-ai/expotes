"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManifestModule = void 0;
const common_1 = require("@nestjs/common");
const manifest_service_1 = require("./manifest.service");
const manifest_controller_1 = require("./manifest.controller");
const driective_service_1 = require("./driective.service");
let ManifestModule = class ManifestModule {
};
exports.ManifestModule = ManifestModule;
exports.ManifestModule = ManifestModule = __decorate([
    (0, common_1.Module)({
        controllers: [manifest_controller_1.ManifestController],
        providers: [manifest_service_1.ManifestService, driective_service_1.DriectiveService],
        exports: [manifest_service_1.ManifestService],
    })
], ManifestModule);
//# sourceMappingURL=manifest.module.js.map