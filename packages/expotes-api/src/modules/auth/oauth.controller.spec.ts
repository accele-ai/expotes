import { Test, TestingModule } from "@nestjs/testing";
import { SessionService } from "../session/session.service";
import { AuthService } from "./auth.service";
import { OauthController } from "./oauth.controller";
import { OauthService } from "./oauth.service";

describe("OauthController", () => {
	let controller: OauthController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{ provide: AuthService, useValue: {} },
				{ provide: OauthService, useValue: {} },
				{ provide: SessionService, useValue: {} },
			],
			controllers: [OauthController],
		}).compile();

		controller = module.get<OauthController>(OauthController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
