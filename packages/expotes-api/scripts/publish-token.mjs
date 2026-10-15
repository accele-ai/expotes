import { createHash, randomBytes, randomUUID } from "node:crypto";
import postgres from "postgres";

const [command, value, channel, expiresAt, ...extra] = process.argv.slice(2);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (
	!value ||
	!uuid.test(value) ||
	extra.length ||
	(command !== "create" && command !== "revoke") ||
	(command === "revoke" && (channel || expiresAt)) ||
	(command === "create" &&
		((channel !== "preview" && channel !== "production") ||
			!expiresAt ||
			!Number.isFinite(Date.parse(expiresAt)) ||
			Date.parse(expiresAt) <= Date.now()))
) {
	throw new Error(
		"Usage: publish-token.mjs create <app-uuid> <preview|production> <future-ISO-expiry> | revoke <token-uuid>",
	);
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const sql = postgres(process.env.DATABASE_URL, { max: 1 });
try {
	if (command === "create") {
		const token = `expotes_${randomBytes(32).toString("base64url")}`;
		const id = randomUUID();
		const hash = createHash("sha256").update(token).digest("hex");
		await sql`INSERT INTO publish_tokens (id, token_hash, app_id, channel, expires_at) VALUES (${id}, ${hash}, ${value}, ${channel}, ${new Date(expiresAt)})`;
		process.stdout.write(
			`${JSON.stringify({ id, appId: value, channel, expiresAt, token })}\n`,
		);
	} else {
		const rows =
			await sql`DELETE FROM publish_tokens WHERE id = ${value} RETURNING id`;
		if (rows.length === 0) throw new Error("Publish token was not found");
		process.stdout.write(`${JSON.stringify({ revoked: value })}\n`);
	}
} finally {
	await sql.end();
}
