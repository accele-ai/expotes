import { join } from "node:path";
import type { INestiaConfig } from "@nestia/sdk";

const config: INestiaConfig = {
	input: ["src/modules/**/*.controller.ts"],
	output: join(__dirname, "../expotes-sdk/src"),
	clone: true,
};
export default config;
