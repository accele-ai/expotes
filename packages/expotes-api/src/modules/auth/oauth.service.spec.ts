import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseService } from "../../processors/database/database.service";
import { AuthService } from "./auth.service";
import { OauthService } from "./oauth.service";

describe("OauthService", () => {
	let service: OauthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{ provide: DatabaseService, useValue: {} },
				{ provide: AuthService, useValue: {} },
				OauthService,
			],
		}).compile();

		service = module.get<OauthService>(OauthService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
