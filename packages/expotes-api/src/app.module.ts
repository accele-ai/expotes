import { join } from "node:path";
import { SessionModule } from "@/modules/session/session.module";
import { UserModule } from "@/modules/user/user.module";
import { CacheModule } from "@/processors/cache/cache.module";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { APP_FILTER } from "@nestjs/core";
import { MulterModule } from "@nestjs/platform-express";
import { ServeStaticModule } from "@nestjs/serve-static";
import { AllExceptionsFilter } from "./common/filters/all-exception.filter";
import { AuthGuard } from "./common/guards/auth.guard";
import { ApplicationModule } from "./modules/application/application.module";
import { AssetsModule } from "./modules/assets/assets.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ManifestModule } from "./modules/manifest/manifest.module";
import { ProviderModule } from "./modules/provider/provider.module";
import { TeamModule } from "./modules/team/team.module";
import { UpdatesModule } from "./modules/updates/updates.module";
import { DatabaseModule } from "./processors/database/database.module";

const staticPath =
	process.env.NODE_ENV === "production"
		? process.env.PROD_STATIC_PATH
		: join(__dirname, "..", "static");
@Module({
	imports: [
		...(staticPath
			? [
					ServeStaticModule.forRoot({
						rootPath: staticPath,
						renderPath: "/",
						serveStaticOptions: { index: "index.html", redirect: true },
						exclude: ["/api/(.*)"],
					}),
				]
			: []),
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		MulterModule.register({
			dest: "./uploads",
		}),

		// processors
		DatabaseModule,
		CacheModule,

		// helper
		SessionModule,

		// BIZ
		AuthModule,
		UserModule,
		TeamModule,
		ApplicationModule,
		UpdatesModule,
		AssetsModule,
		ManifestModule,
		ProviderModule,
	],
	providers: [
		Logger,

		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
		{
			provide: APP_FILTER,
			useClass: AllExceptionsFilter,
		},
	],
})
export class AppModule {}
