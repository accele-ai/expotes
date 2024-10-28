import {
	Controller,
	Get,
	Param,
	Query,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { AssetsService } from "./assets.service";
import { ApiController } from "@/common/decorators/api-controller.decorator";
import {
	ExpoUpdatesV1,
	ExpoUpdatesV1Dto,
} from "@/common/decorators/expo-updates-v1";
import { Public } from "@/common/decorators/auth.decorator";
import { ExpoResponseHeaderInterceptor } from "@/common/interceptors/expo-response.interceptors";

@Public()
@ApiController("assets")
export class AssetsController {
	constructor(private readonly assetsService: AssetsService) {}

	@Get(":assetId")
	@UseInterceptors(ExpoResponseHeaderInterceptor)
	// @UsePipes(new ValidationPipe({ transform: true }))
	getAssets(
		@Param("assetId") assetId: string,
		// @ExpoUpdatesV1() meta: ExpoUpdatesV1Dto,
	) {
		console.log("assetId", assetId);
		return this.assetsService.getAssetObject(assetId);
	}
}
