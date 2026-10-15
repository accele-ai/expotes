import { CacheModule } from "@/processors/cache/cache.module";
import { Global, Module } from "@nestjs/common";
import { PublishTokenService } from "./publish-token.service";
import { SessionService } from "./session.service";

@Module({
	imports: [CacheModule],
	providers: [SessionService, PublishTokenService],
	exports: [SessionService, PublishTokenService],
})
@Global() // Make session module because AuthGuard will use it
export class SessionModule {}
