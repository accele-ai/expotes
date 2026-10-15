import { Public } from "@/common/decorators/auth.decorator";
import { Team } from "@/common/decorators/get-owner-decorator";
import { Publish } from "@/common/decorators/publish.decorator";
import { PublishTokenService } from "@/modules/session/publish-token.service";
import { SessionService } from "@/modules/session/session.service";
import type { ContextRequest } from "@/transformers/get-req.transformer";
import { Controller, Get, INestApplication, Req } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AuthGuard } from "./auth.guard";

@Controller()
class GuardProbe {
	@Public()
	@Get("public")
	public() {
		return { ok: true };
	}

	@Get("team")
	team(@Team() teamId: string) {
		return { teamId };
	}

	@Publish()
	@Get("publish")
	publish(@Req() req: ContextRequest) {
		return req.publishScope;
	}
}

describe("AuthGuard HTTP authorization", () => {
	let app: INestApplication;
	const teamId = "b63a3c98-31aa-4bd7-8749-859f1624fb2c";
	const session = { find: jest.fn(), verifyUserTeam: jest.fn() };
	const tokens = { verify: jest.fn() };

	beforeAll(async () => {
		const module = await Test.createTestingModule({
			controllers: [GuardProbe],
			providers: [
				{ provide: APP_GUARD, useClass: AuthGuard },
				{ provide: SessionService, useValue: session },
				{ provide: PublishTokenService, useValue: tokens },
			],
		}).compile();
		app = module.createNestApplication();
		app.use(cookieParser());
		await app.init();
	});
	beforeEach(() => {
		jest.clearAllMocks();
		session.find.mockResolvedValue({ userId: "user" });
		session.verifyUserTeam.mockResolvedValue(true);
	});
	afterAll(() => app.close());

	it("returns 401 when a private endpoint has no session", async () => {
		await request(app.getHttpServer()).get("/team").expect(401);
	});
	it("allows an anonymous public request without dereferencing a missing owner", async () => {
		session.find.mockResolvedValue(null);
		await request(app.getHttpServer())
			.get("/public")
			.set("Cookie", "JST=expired")
			.set("expotes-team-id", teamId)
			.expect(200);
		expect(session.verifyUserTeam).not.toHaveBeenCalled();
	});
	it("requires an explicit authorized team", async () => {
		await request(app.getHttpServer())
			.get("/team")
			.set("Cookie", "JST=session")
			.expect(403);
	});
	it("denies access when membership is absent or suspended", async () => {
		session.verifyUserTeam.mockResolvedValue(false);
		await request(app.getHttpServer())
			.get("/team")
			.set("Cookie", "JST=session")
			.set("expotes-team-id", teamId)
			.expect(403);
	});
	it("uses verified membership for a session request", async () => {
		await request(app.getHttpServer())
			.get("/team")
			.set("Cookie", "JST=session")
			.set("expotes-team-id", teamId)
			.expect(200, { teamId });
	});
	it("limits bearer tokens to publishing endpoints", async () => {
		await request(app.getHttpServer())
			.get("/team")
			.set("Authorization", "Bearer test-token")
			.expect(403);
		expect(tokens.verify).not.toHaveBeenCalled();
	});
	it("derives the publishing team from the token instead of a supplied team header", async () => {
		const scope = { appId: "app", teamId, channel: "preview" };
		tokens.verify.mockResolvedValue(scope);
		await request(app.getHttpServer())
			.get("/publish")
			.set("Authorization", "Bearer test-token")
			.set("expotes-team-id", "attacker-team")
			.expect(200, scope);
		expect(tokens.verify).toHaveBeenCalledWith("test-token");
	});
});
