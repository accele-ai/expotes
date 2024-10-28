/* eslint-disable @typescript-eslint/ban-ts-comment */
import { userOAuthTable, usersTable } from "@db/schema";
import { Injectable } from "@nestjs/common";
// @ts-ignore
import { generateState, GitHub } from "arctic";
import { and, eq } from "drizzle-orm";
// @ts-ignore
import { serializeCookie } from "oslo/cookie";
import { AuthService } from "./auth.service";
import { DatabaseService } from "@/processors/database/database.service";
import { Response } from "express";

interface GitHubUserResult {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string | null;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: boolean;
	name: string | null;
	company: string | null;
	blog: string | null;
	location: string | null;
	email: string;
	hireable: boolean | null;
	bio: string | null;
	twitter_username: string | null;
	public_repos: number;
	public_gists: number;
	followers: number;
	following: number;
	created_at: string;
	updated_at: string;
}

@Injectable()
export class OauthService {
	github: GitHub;

	constructor(
		private db: DatabaseService,
		private authService: AuthService,
	) {
		this.github = new GitHub(
			process.env.GITHUB_CLIENT_ID!,
			process.env.GITHUB_CLIENT_SECRET!,
		);
	}

	async getGithubAuthUrl(res: Response) {
		const state = generateState();
		const url = await this.github.createAuthorizationURL(state);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		res.cookie("github_oauth_state", state, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "PRODUCTION", // set `Secure` flag in HTTPS
			maxAge: 60 * 10, // 10 minutes
			path: "/",
		});
		return url;
	}

	/**
	 * Handles the GitHub OAuth callback, validates the code, and manages user authentication.
	 * @param state - The state parameter returned by GitHub.
	 * @param code - The authorization code returned by GitHub.
	 * @param stateCookie - The state stored in the cookie for verification.
	 * @returns User Id
	 */
	async githubCallback(state: string, code: string, stateCookie: string) {
		const tokens = await this.github.validateAuthorizationCode(code);
		const githubUserResponse = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`,
			},
		});
		const githubUserResult: GitHubUserResult = await githubUserResponse.json();

		const providerId = String(githubUserResult.id);
		const existingUser = await this.db.query.userOAuthTable.findFirst({
			where: and(
				eq(userOAuthTable.providerId, providerId),
				eq(userOAuthTable.provider, "github"),
			),
		});

		if (existingUser) {
			return existingUser.userId;
		}

		const existingUserByEmail = githubUserResult.email
			? await this.db.query.usersTable.findFirst({
					where: eq(usersTable.email, githubUserResult.email),
				})
			: null;

		if (existingUserByEmail) {
			await this.db.insert(userOAuthTable).values({
				userId: existingUserByEmail.id,
				providerId: providerId,
				provider: "github",
			});
			return existingUserByEmail.id;
		}

		const newUserId = await this.db.transaction(async (tx) => {
			const newUser = await tx
				.insert(usersTable)
				.values({
					name: githubUserResult.name,
					email: githubUserResult.email,
				})
				.returning({ id: usersTable.id });

			await tx.insert(userOAuthTable).values({
				userId: newUser[0].id,
				providerId: providerId,
				provider: "github",
			});

			return newUser[0].id;
		});
		return newUserId;
	}
}
