/* 存储在 Redis 数据库中 Session 的 Payload */
export interface ISessionPayload {
	userId: string;
	sessionId: string;
	email: string;
	createdAt: Date;
	extra?: {
		ua: string;
		geo?: string;
		ip: string;
	};
}
