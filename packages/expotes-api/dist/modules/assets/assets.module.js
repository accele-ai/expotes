var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { ManifestModule } from '../manifest/manifest.module';
let AssetsModule = class AssetsModule {
};
AssetsModule = __decorate([
    Module({
        imports: [ManifestModule],
        controllers: [AssetsController],
        providers: [AssetsService],
        exports: [AssetsService],
    })
], AssetsModule);
export { AssetsModule };
//# sourceMappingURL=assets.module.js.map