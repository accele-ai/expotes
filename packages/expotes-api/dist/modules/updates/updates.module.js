var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { UpdatesService } from './updates.service';
import { UpdatesController as UpdatesController } from './updates.controller';
import { StorageService } from './storage.services';
import { ManifestModule } from '../manifest/manifest.module';
import { AssetsModule } from '../assets/assets.module';
let UpdatesModule = class UpdatesModule {
};
UpdatesModule = __decorate([
    Module({
        imports: [ManifestModule, AssetsModule],
        controllers: [UpdatesController],
        providers: [UpdatesService, StorageService],
        exports: [StorageService],
    })
], UpdatesModule);
export { UpdatesModule };
//# sourceMappingURL=updates.module.js.map