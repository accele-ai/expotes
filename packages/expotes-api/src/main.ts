import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { dbMigration } from "./migrator";

async function bootstrap() {
	if (process.env.NODE_ENV === "production") {
		await dbMigration();
	}

	const app = await NestFactory.create(AppModule, {
		logger: ["error", "warn", "log", "debug", "verbose"],
	});
	app.use(cookieParser());

	app.setGlobalPrefix("api");

	await app.listen(3001);
}

bootstrap();
