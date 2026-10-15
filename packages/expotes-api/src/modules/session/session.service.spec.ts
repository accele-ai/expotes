import { CacheService } from "@/processors/cache/cache.service";
import { DatabaseService } from "@/processors/database/database.service";
import { Test } from "@nestjs/testing";
import { SessionService } from "./session.service";

describe("SessionService team authorization", () => {
	const findFirst = jest.fn();
	const sismember = jest.fn().mockResolvedValue(1);
	let service: SessionService;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [
				SessionService,
				{
					provide: DatabaseService,
					useValue: { query: { usersToTeams: { findFirst } } },
				},
				{ provide: CacheService, useValue: { redisClient: { sismember } } },
			],
		}).compile();
		service = module.get(SessionService);
	});

	it("denies missing membership even if an older version cached access", async () => {
		findFirst.mockResolvedValue(undefined);
		await expect(service.verifyUserTeam("user", "team")).resolves.toBe(false);
		expect(sismember).not.toHaveBeenCalled();
	});

	it("denies a suspended member", async () => {
		findFirst.mockResolvedValue({ isSuspended: true });
		await expect(service.verifyUserTeam("user", "team")).resolves.toBe(false);
	});

	it.each([false, null])(
		"allows an active member with isSuspended=%s",
		async (isSuspended) => {
			findFirst.mockResolvedValue({ isSuspended });
			await expect(service.verifyUserTeam("user", "team")).resolves.toBe(true);
		},
	);
});
