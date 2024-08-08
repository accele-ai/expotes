import { teamsTable } from '@db/schema';

type ITeamInsert = typeof teamsTable.$inferInsert;

export interface CreateTeamDto extends ITeamInsert {
  userId: string;
}
