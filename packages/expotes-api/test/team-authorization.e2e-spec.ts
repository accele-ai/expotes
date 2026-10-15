import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { IntegrationFixture } from "./integration-fixture";

interface User {
	id: string;
	cookie: string;
}

describe("Team authorization through public sessions", () => {
	const fixture = new IntegrationFixture();
	const users: User[] = [];
	let owner: User;
	let member: User;
	let outsider: User;
	let ownedTeam: { id: string; name: string; handle: string };

	function request(
		user: User | undefined,
		method: string,
		path: string,
		body?: unknown,
		teamId?: string,
	) {
		return fetch(`${fixture.url}/api/v1/${path}`, {
			method,
			headers: {
				"Content-Type": "application/json",
				...(user ? { Cookie: user.cookie } : {}),
				...(teamId ? { "expotes-team-id": teamId } : {}),
			},
			body: body === undefined ? undefined : JSON.stringify(body),
		});
	}

	async function register(label: string): Promise<User> {
		const email = `${label}@expotes.test`;
		const response = await request(undefined, "POST", "auth/register", {
			email,
			password: randomBytes(24).toString("base64url"),
		});
		expect(response.status).toBe(201);
		const cookie = response.headers.get("set-cookie")?.split(";")[0];
		assert(cookie);
		const [row] = await fixture.sql<
			{ id: string }[]
		>`SELECT id FROM users WHERE email = ${email}`;
		const user = { id: row.id, cookie };
		users.push(user);
		return user;
	}

	beforeAll(async () => {
		await fixture.start();
		owner = await register("owner");
		member = await register("member");
		outsider = await register("outsider");
		const response = await request(owner, "POST", "team/create", {
			name: "Owned team",
			handle: "owned",
		});
		expect(response.status).toBe(201);
		ownedTeam = await response.json();
		const added = await request(owner, "POST", "team/add-member", {
			users: [{ teamId: ownedTeam.id, userId: member.id }],
		});
		expect(added.status).toBe(201);
	});

	afterAll(async () => {
		try {
			for (const user of users) {
				const response = await request(user, "POST", "auth/logout");
				expect(response.status).toBe(201);
			}
		} finally {
			await fixture.stop();
		}
	});

	it("makes only the team creator an administrator", async () => {
		const [creator] =
			await fixture.sql`SELECT role, is_suspended FROM users_to_teams WHERE team_id = ${ownedTeam.id} AND user_id = ${owner.id}`;
		expect(creator.role).toBe("admin");
		expect(creator.is_suspended).not.toBe(true);
		const [{ count }] =
			await fixture.sql`SELECT count(*)::int AS count FROM users_to_teams WHERE team_id = ${fixture.teamId} AND role = 'admin'`;
		expect(count).toBe(0);
	});

	it("blocks a publicly registered user from joining or changing another team", async () => {
		const joined = await request(outsider, "POST", "team/add-member", {
			users: [{ teamId: fixture.teamId, userId: outsider.id, role: "admin" }],
		});
		expect(joined.status).toBe(403);
		const changed = await request(outsider, "PUT", "team/update", {
			id: fixture.teamId,
			name: "Stolen",
			handle: "stolen",
			users: [],
		});
		expect(changed.status).toBe(403);
		const removed = await request(
			outsider,
			"DELETE",
			`team/delete/${fixture.teamId}`,
		);
		expect(removed.status).toBe(403);
		const [{ count }] =
			await fixture.sql`SELECT count(*)::int AS count FROM users_to_teams WHERE team_id = ${fixture.teamId} AND user_id = ${outsider.id}`;
		expect(count).toBe(0);
		const publishing = await request(
			outsider,
			"POST",
			"updates/create",
			{},
			fixture.teamId,
		);
		expect(publishing.status).toBe(403);
	});

	it.each([
		{ role: "user", suspended: false },
		{ role: "admin", suspended: true },
	])(
		"rejects administration for role=$role, suspended=$suspended",
		async ({ role, suspended }) => {
			await fixture.sql`UPDATE users_to_teams SET role = ${role}, is_suspended = ${suspended} WHERE team_id = ${ownedTeam.id} AND user_id = ${member.id}`;
			const added = await request(member, "POST", "team/add-member", {
				users: [{ teamId: ownedTeam.id, userId: outsider.id }],
			});
			expect(added.status).toBe(403);
			const changed = await request(member, "PUT", "team/update", {
				...ownedTeam,
				users: [],
			});
			expect(changed.status).toBe(403);
			const removed = await request(
				member,
				"DELETE",
				`team/delete/${ownedTeam.id}`,
			);
			expect(removed.status).toBe(403);
		},
	);

	it("limits administrator member updates to one team", async () => {
		await fixture.sql`INSERT INTO users_to_teams (team_id, user_id, role) VALUES (${fixture.teamId}, ${member.id}, 'user')`;
		const crossTeam = await request(owner, "PUT", "team/update", {
			...ownedTeam,
			handle: "cross-team",
			users: [
				{
					teamId: fixture.teamId,
					userId: member.id,
					role: "admin",
					isSuspended: false,
				},
			],
		});
		expect(crossTeam.status).toBe(403);
		const [unchanged] =
			await fixture.sql`SELECT handle FROM teams WHERE id = ${ownedTeam.id}`;
		expect(unchanged.handle).toBe(ownedTeam.handle);
		const updated = await request(owner, "PUT", "team/update", {
			...ownedTeam,
			users: [
				{
					teamId: ownedTeam.id,
					userId: member.id,
					role: "admin",
					isSuspended: false,
				},
			],
		});
		expect(updated.status).toBe(200);
		const [owned] =
			await fixture.sql`SELECT role, is_suspended FROM users_to_teams WHERE team_id = ${ownedTeam.id} AND user_id = ${member.id}`;
		const [other] =
			await fixture.sql`SELECT role, is_suspended FROM users_to_teams WHERE team_id = ${fixture.teamId} AND user_id = ${member.id}`;
		expect(owned).toEqual({ role: "admin", is_suspended: false });
		expect(other).toEqual({ role: "user", is_suspended: null });
	});

	it("creates applications only in the session's authorized team", async () => {
		const body = {
			name: "Owned application",
			handle: "owned-app",
			teamId: ownedTeam.id,
		};
		expect(
			(await request(owner, "POST", "application/create", body)).status,
		).toBe(403);
		const mismatch = await request(
			owner,
			"POST",
			"application/create",
			{ ...body, teamId: fixture.teamId },
			ownedTeam.id,
		);
		expect(mismatch.status).toBe(403);
		expect(
			(await request(owner, "POST", "application/create", body, fixture.teamId))
				.status,
		).toBe(403);
		const created = await request(
			owner,
			"POST",
			"application/create",
			body,
			ownedTeam.id,
		);
		expect(created.status).toBe(201);
		const [application]: { teamId: string }[] = await created.json();
		expect(application.teamId).toBe(ownedTeam.id);
		await fixture.sql`UPDATE users_to_teams SET is_suspended = true WHERE team_id = ${ownedTeam.id} AND user_id = ${member.id}`;
		const listing = await request(
			member,
			"GET",
			`application/list?teamId=${ownedTeam.id}`,
		);
		expect(listing.status).toBe(403);
	});

	it("allows an active administrator to delete an empty team", async () => {
		const response = await request(owner, "POST", "team/create", {
			name: "Disposable",
			handle: "disposable",
		});
		expect(response.status).toBe(201);
		const team: { id: string } = await response.json();
		const removed = await request(owner, "DELETE", `team/delete/${team.id}`);
		expect(removed.status).toBe(200);
		const [{ count }] =
			await fixture.sql`SELECT count(*)::int AS count FROM teams WHERE id = ${team.id}`;
		expect(count).toBe(0);
	});
});
