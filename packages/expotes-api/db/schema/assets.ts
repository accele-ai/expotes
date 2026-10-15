import { relations } from "drizzle-orm";
import { integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { manifestsTable } from "./mainfest";

export const assetsTable = pgTable("assets", {
	/* The ID MUST uniquely specify the manifest and MUST be a UUID. */
	id: uuid("id").primaryKey(),
	manifestId: uuid("manifest_id")
		.references(() => manifestsTable.id)
		.notNull(),
	assetKey: varchar("asset_key").notNull(),
	// Legacy records have no platform; new uploads always specify one.
	platform: varchar("platform", { enum: ["ios", "android"] }),
	/* url: Location at which the file may be fetched.
  path here is minio bucket(assest) key*/
	path: varchar("path").notNull(),
	/* The MIME type of the file as defined by RFC 2045. 
  For example, application/javascript, image/jpeg. */
	contentType: varchar("content_type").notNull(),
	/* Base64URL-encoded SHA-256 hash of the file to guarantee integrity. 
  Base64URL encoding is defined by IETF RFC 4648. */
	hash: varchar("hash"),
	/* The suggested extension to use when a file is saved on a client.
   Some platforms, such as iOS, require certain file types to be saved with an extension. 
   The extension MUST be prefixed with a .. For example, .jpeg. 
   In some cases, such as the launchAsset, this field will be ignored in favor of a locally determined extension. 
   If the field is omitted and there is no locally stipulated extension, the asset will be saved without an extension. 
   For example, ./filename with no . at the end. 
   A conforming client SHOULD prefix a file extension with a . if a file extension is not empty and missing the . prefix. */
	fileExtension: varchar("file_extension"),
});

export const assetsRelation = relations(assetsTable, ({ one }) => ({
	manifest: one(manifestsTable, {
		fields: [assetsTable.manifestId],
		references: [manifestsTable.id],
	}),
}));
