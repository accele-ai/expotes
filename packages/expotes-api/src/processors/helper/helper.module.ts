import { Module } from "@nestjs/common";
import { CDNService } from "./cdn/cdn.service";
import { StorageService } from "./storage/storage.services";

@Module({
	providers: [StorageService, CDNService],
	exports: [StorageService, CDNService],
})
export class HelperModule {}
