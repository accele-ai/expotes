// assets-query.dto.ts
import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class ManifestQueryDto {
	@IsString()
	@IsNotEmpty({ message: "No runtimeVersion provided." })
	"runtime-version": string;

	@IsIn(["ios", "android"], {
		message: "Unsupported platform. Expected either ios or android.",
	})
	platform: "ios" | "android";
}
