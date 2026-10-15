import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseService } from "../../processors/database/database.service";
import { UserService } from "./user.service";

describe("UserService", () => {
	let service: UserService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DatabaseService, useValue: {} }, UserService],
		}).compile();

		service = module.get<UserService>(UserService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
