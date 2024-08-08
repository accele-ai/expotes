import { teamsTable } from '@db/schema';

type ITeamInsert = typeof teamsTable.$inferInsert;

export class CreateTeamDto {
  userId: string;
  handle: ITeamInsert['handle'];
}
