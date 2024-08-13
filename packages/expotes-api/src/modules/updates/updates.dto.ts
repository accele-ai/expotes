import { applicationsTable, manifestsTable } from '@db/schema';

export class CreateUpdatesDto {
  appId: string;
}

type IApplicationSelect = typeof applicationsTable.$inferSelect;
type IManifestSelect = typeof manifestsTable.$inferSelect;

export interface FindAllUpdatesDto extends Omit<IManifestSelect, 'appId'> {
  applications?: IApplicationSelect;
}
