import { Injectable } from "@nestjs/common";
import { DatabaseService } from "@/processors/database/database.service";
import { CacheService } from "@/processors/cache/cache.service";
import { Redis } from "ioredis";
import { RedisKeys, SESSION_DURATION } from "@/constants/cache.constant";
import { nanoid } from "nanoid";
import { ISessionPayload } from "@/modules/session/session.dto";
import { usersToTeams } from "@db/schema";
import { and, eq } from "drizzle-orm";

export interface SessionResult {
	value: string;
	expires: Date;
}

@Injectable()
export class SessionService {
	redisClient: Redis;

	constructor(
		private readonly db: DatabaseService,
		private readonly cache: CacheService,
	) {
		this.redisClient = this.cache.redisClient;
	}

	async create(
		userId: string,
		payload?: Omit<ISessionPayload, "userId" | "sessionId">,
	): Promise<SessionResult> {
		const sessionId = nanoid();
		const now = Date.now();
		const expiresTimestampMs = now + SESSION_DURATION * 1000;
		const sessionKey = this.cache.createCacheKey(
			RedisKeys.SessionStore,
			sessionId,
		);
		const sessionsKey = this.cache.createCacheKey(
			RedisKeys.SessionsStore,
			userId.toString(),
		);

		await this.redisClient
			.multi()
			.hset(sessionKey, {
				userId: String(userId),
				...payload,
				extra: JSON.stringify(payload?.extra),
			})
			.expire(sessionKey, SESSION_DURATION)
			.zremrangebyscore(sessionsKey, "-inf", now)
			.zadd(sessionsKey, expiresTimestampMs, sessionId)
			.exec();

		return {
			value: sessionId,
			expires: new Date(expiresTimestampMs),
		};
	}

	/**
	 * Gets a session by ID.
	 * @param sessionId The session ID.
	 */
	async find(sessionId: string): Promise<ISessionPayload | null> {
		const result = await this.redisClient.hgetall(
			this.cache.createCacheKey(RedisKeys.SessionStore, sessionId),
		);
		if (Object.keys(result).length === 0) {
			return null;
		}
		result.sessionId = sessionId;
		return result as unknown as ISessionPayload;
	}

	/**
	 * Revoke a session by ID.
	 * @param userId The user ID.
	 * @param sessionId The session ID.
	 */
	async revokeOne(userId: string, sessionId: string): Promise<void> {
		const data = await this.find(sessionId);
		if (!data || data.userId !== userId) {
			return;
		}
		await this.redisClient
			.multi()
			.del(this.cache.createCacheKey(RedisKeys.SessionStore, sessionId))
			.zrem(
				this.cache.createCacheKey(RedisKeys.SessionsStore, data.userId),
				sessionId,
			)
			.exec(); // TODO handle errors
	}

	async refresh(sessionId: string): Promise<Date> {
		const sessionKey = RedisKeys.SessionStore + sessionId;
		const userId = await this.redisClient.hget(sessionKey, "userId");

		const now = Date.now();
		if (userId) {
			const expires = now + SESSION_DURATION * 1000;
			const sessionsKey = RedisKeys.SessionsStore + userId;
			await this.redisClient
				.multi()
				.expire(sessionKey, SESSION_DURATION)
				.zadd(sessionsKey, expires, sessionId)
				.exec();
			return new Date(expires);
		} else {
			const ttl = await this.redisClient.ttl(sessionKey);
			return new Date(now + ttl * 1000);
		}
	}

	async verifyUserTeam(userId: string, teamId: string) {
		const key = RedisKeys.TeamUserStore + teamId;
		const fallbackKey = `${RedisKeys.TeamUserStore}:fallback:${teamId}`;
		const fallbackTTL = 60 * 60; // 1 hour

		// Check if user is in the team's set
		const isUserInTeam = await this.redisClient.sismember(key, userId);
		if (isUserInTeam) {
			return true;
		}

		// Check if user is in the fallback set
		const isUserInFallback = await this.redisClient.sismember(
			fallbackKey,
			userId,
		);
		if (isUserInFallback) {
			return false;
		}

		// If not in either, check the database
		const isUserInTeamDB = await this.db.query.usersToTeams.findFirst({
			where: and(
				eq(usersToTeams.userId, userId),
				eq(usersToTeams.teamId, teamId),
			),
		});

		if (isUserInTeamDB !== null) {
			await this.redisClient.sadd(key, userId);
			return true;
		} else {
			// Add user to fallback set with TTL
			await this.redisClient
				.multi()
				.sadd(fallbackKey, userId)
				.expire(fallbackKey, fallbackTTL)
				.exec();
			return false;
		}
	}
}
