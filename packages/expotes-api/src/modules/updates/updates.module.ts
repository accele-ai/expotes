import { HelperModule } from "@/processors/helper/helper.module";
import { Module } from "@nestjs/common";
import { UpdatesController } from "./updates.controller";
import { UpdatesService } from "./updates.service";

@Module({
	imports: [HelperModule],
	controllers: [UpdatesController],
	providers: [UpdatesService],
})
export class UpdatesModule {}
