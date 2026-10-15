import { HelperModule } from "@/processors/helper/helper.module";
import { Module } from "@nestjs/common";
import { ApplicationModule } from "../application/application.module";
import { ManifestController } from "./manifest.controller";
import { ManifestService } from "./manifest.service";

@Module({
	imports: [HelperModule, ApplicationModule],
	controllers: [ManifestController],
	providers: [ManifestService],
	exports: [ManifestService],
})
export class ManifestModule {}
