import { teamsTable } from '@expotes/db/schema';
import { UpdateTeamUserDTO } from '../user/user.dto';

type ITeamInsert = typeof teamsTable.$inferInsert;

export interface CreateTeamDto extends ITeamInsert {
  userId: string;
}

export interface UpdateTeamDto extends ITeamInsert {
  users: UpdateTeamUserDTO[];
}
