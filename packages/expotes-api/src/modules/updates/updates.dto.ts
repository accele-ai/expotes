import {
  applicationsTable,
  ManifestsOptions,
  manifestsTable,
} from '@db/schema';

export class CreateUpdatesDto {
  appId: string;
  runtimeVersion: string;
  /* a json string of the options */
  options: string;
}

type IApplicationSelect = typeof applicationsTable.$inferSelect;
type IManifestSelect = typeof manifestsTable.$inferSelect;

export interface FindAllUpdatesDto extends Omit<IManifestSelect, 'appId'> {
  applications?: IApplicationSelect;
}
