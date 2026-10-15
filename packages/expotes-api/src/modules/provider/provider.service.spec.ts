import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseService } from "../../processors/database/database.service";
import { ProviderService } from "./provider.service";

describe("ProviderService", () => {
	let service: ProviderService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DatabaseService, useValue: {} }, ProviderService],
		}).compile();

		service = module.get<ProviderService>(ProviderService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
