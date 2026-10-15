import { Module } from "@nestjs/common";
import { ProviderController } from "./provider.controller";
import { ProviderService } from "./provider.service";

@Module({
	controllers: [ProviderController],
	providers: [ProviderService],
})
export class ProviderModule {}
