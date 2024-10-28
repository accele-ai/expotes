import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import { dbMigration } from "./migrator";

async function bootstrap() {
	await dbMigration();

	const app = await NestFactory.create(AppModule, {
		logger: ["error", "warn", "log", "debug", "verbose"],
	});
	app.use(cookieParser());

	app.setGlobalPrefix("api");

	await app.listen(3000);
}

bootstrap();
