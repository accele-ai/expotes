import { ForbiddenException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseService } from "../../processors/database/database.service";
import { ApplicationService } from "./application.service";

describe("ApplicationService", () => {
	let service: ApplicationService;
	const findMembership = jest.fn();
	const findApplications = jest.fn();
	const db = {
		insert: jest.fn(),
		query: {
			usersToTeams: { findFirst: findMembership },
			applicationsTable: { findMany: findApplications },
		},
	};

	beforeEach(async () => {
		jest.resetAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{ provide: DatabaseService, useValue: db },
				ApplicationService,
			],
		}).compile();

		service = module.get<ApplicationService>(ApplicationService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
	it("rejects a body team that differs from the authorized team", () => {
		expect(() =>
			service.create(
				{ name: "Unauthorized", handle: "unauthorized", teamId: "other-team" },
				"owned-team",
			),
		).toThrow(ForbiddenException);
		expect(db.insert).not.toHaveBeenCalled();
	});

	it.each([undefined, { isSuspended: true }])(
		"rejects inactive membership when listing applications",
		async (membership) => {
			findMembership.mockResolvedValue(membership);
			await expect(service.findAll("team", "user")).rejects.toThrow(
				ForbiddenException,
			);
			expect(findApplications).not.toHaveBeenCalled();
		},
	);
});
