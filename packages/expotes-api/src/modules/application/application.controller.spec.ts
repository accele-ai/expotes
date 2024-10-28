import { Test, type TestingModule } from "@nestjs/testing";
import { ApplicationController } from "./application.controller";
import { ApplicationService } from "./application.service";

describe("ApplicationController", () => {
	let controller: ApplicationController;
	let service: ApplicationService;

	beforeEach(async () => {
		const moduleRef: TestingModule = await Test.createTestingModule({
			controllers: [ApplicationController],
			providers: [ApplicationService],
		}).compile();

		controller = moduleRef.get<ApplicationController>(ApplicationController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
