import type { CursorPagerDto } from "@/shared/dto/pager.dto";
import type { applicationsTable, manifestsTable } from "@db/schema";
import type { UpdateChannel } from "./updates.interface";

export class CreateUpdatesDto {
	appId: string;
	runtimeVersion: string;
	channel?: UpdateChannel;
	options?: string;
	notes?: string;
}

export interface FindAllUpdatesDto extends CursorPagerDto {
	appId?: string;
}

type IApplicationSelect = typeof applicationsTable.$inferSelect;
type IManifestSelect = typeof manifestsTable.$inferSelect;

export interface FindAllUpdatesEntity extends Omit<IManifestSelect, "appId"> {
	applications?: IApplicationSelect;
}
