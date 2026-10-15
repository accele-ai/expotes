import { ApiController } from "@/common/decorators/api-controller.decorator";
import { Public } from "@/common/decorators/auth.decorator";
import { Get, Param, ParseUUIDPipe } from "@nestjs/common";
import { AssetsService } from "./assets.service";

@Public()
@ApiController("assets")
export class AssetsController {
	constructor(private readonly assetsService: AssetsService) {}

	@Get(":assetId")
	getAssets(@Param("assetId", ParseUUIDPipe) assetId: string) {
		return this.assetsService.getAssetObject(assetId);
	}
}
