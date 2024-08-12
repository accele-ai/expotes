import { teamsTable, usersToTeams } from '@db/schema';
import { CursorPagerDto } from '@/shared/dto/pager.dto';

type ITeamInsert = typeof teamsTable.$inferInsert;
type IUser2TeamsInsert = typeof usersToTeams.$inferInsert;

export class CreateTeamDto {
  userId: string;
  handle: ITeamInsert['handle'];
}

export interface UpdateTeamDto extends ITeamInsert {
  users: UpdateTeamUserDTO[];
}

export interface Add2TeamDTO {
  users: AddUser2TeamDTO[];
}

export interface TeamFindAllDto extends CursorPagerDto<string> {
  handle?: string;
  createdAt?: Date;
}

export interface AddUser2TeamDTO extends IUser2TeamsInsert {}

export interface UpdateTeamUserDTO extends IUser2TeamsInsert {
  role: 'admin' | 'user';
  isSuspended: boolean;
}
