import type { CursorPagerDto } from "@/shared/dto/pager.dto";
import {
	ManifestsOptions,
	type applicationsTable,
	type manifestsTable,
} from "@db/schema";

export class CreateUpdatesDto {
	appId: string;
	runtimeVersion: string;
	/* a json string of the options */
	options: string;
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
