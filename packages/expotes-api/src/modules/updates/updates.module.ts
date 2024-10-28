import { HelperModule } from "@/processors/helper/helper.module";
import { Module } from "@nestjs/common";
import { AssetsModule } from "../assets/assets.module";
import { ManifestModule } from "../manifest/manifest.module";
import { UpdatesController } from "./updates.controller";
import { UpdatesService } from "./updates.service";

@Module({
	imports: [ManifestModule, AssetsModule, HelperModule],
	controllers: [UpdatesController],
	providers: [UpdatesService],
})
export class UpdatesModule {}
