import { ForbiddenException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseService } from "../../processors/database/database.service";
import { TeamService } from "./team.service";

describe("TeamService", () => {
	let service: TeamService;
	const findMembership = jest.fn();
	const db = {
		query: { usersToTeams: { findFirst: findMembership } },
		transaction: jest.fn(),
		insert: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	};

	beforeEach(async () => {
		jest.resetAllMocks();
		db.transaction.mockImplementation(
			(work: (tx: typeof db) => Promise<unknown>) => work(db),
		);
		const module: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DatabaseService, useValue: db }, TeamService],
		}).compile();

		service = module.get<TeamService>(TeamService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
	it.each([
		{ label: "nonmember", membership: undefined },
		{
			label: "ordinary member",
			membership: { role: "user", isSuspended: false },
		},
		{
			label: "suspended administrator",
			membership: { role: "admin", isSuspended: true },
		},
	])("rejects every team mutation from a $label", async ({ membership }) => {
		findMembership.mockResolvedValue(membership);
		await expect(
			service.addMember(
				{ users: [{ teamId: "target-team", userId: "actor" }] },
				"actor",
			),
		).rejects.toThrow(ForbiddenException);
		await expect(
			service.update(
				{ id: "target-team", name: "Target", handle: "target", users: [] },
				"actor",
			),
		).rejects.toThrow(ForbiddenException);
		await expect(service.delete("target-team", "actor")).rejects.toThrow(
			ForbiddenException,
		);
		expect(db.insert).not.toHaveBeenCalled();
		expect(db.update).not.toHaveBeenCalled();
		expect(db.delete).not.toHaveBeenCalled();
	});

	it("rejects member updates for a different team before changing any rows", async () => {
		findMembership.mockResolvedValue({ role: "admin", isSuspended: null });
		await expect(
			service.update(
				{
					id: "owned-team",
					name: "Owned",
					handle: "owned",
					users: [
						{
							teamId: "other-team",
							userId: "member",
							role: "admin",
							isSuspended: false,
						},
					],
				},
				"actor",
			),
		).rejects.toThrow(ForbiddenException);
		expect(db.update).not.toHaveBeenCalled();
	});

	it("authorizes every target team before adding a mixed-team batch", async () => {
		findMembership
			.mockResolvedValueOnce({ role: "admin", isSuspended: false })
			.mockResolvedValueOnce(undefined);
		await expect(
			service.addMember(
				{
					users: [
						{ teamId: "owned-team", userId: "member" },
						{ teamId: "other-team", userId: "actor" },
					],
				},
				"actor",
			),
		).rejects.toThrow(ForbiddenException);
		expect(db.insert).not.toHaveBeenCalled();
	});
});
