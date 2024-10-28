import { Module } from "@nestjs/common";
import { UpdatesService } from "./updates.service";
import { UpdatesController as UpdatesController } from "./updates.controller";
import { ManifestModule } from "../manifest/manifest.module";
import { AssetsModule } from "../assets/assets.module";
import { HelperModule } from "@/processors/helper/helper.module";

@Module({
	imports: [ManifestModule, AssetsModule, HelperModule],
	controllers: [UpdatesController],
	providers: [UpdatesService],
})
export class UpdatesModule {}
