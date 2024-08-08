import { teamsTable } from '@db/schema';
import { UpdateTeamUserDTO } from '../user/user.dto';
import { CursorPagerDto } from '@/shared/dto/pager.dto';

type ITeamInsert = typeof teamsTable.$inferInsert;

export interface CreateTeamDto extends ITeamInsert {
  userId: string;
}

export interface UpdateTeamDto extends ITeamInsert {
  users: UpdateTeamUserDTO[];
}

export interface TeamPageQueryDto extends CursorPagerDto<string> {
  handle: string;
  createdAt: Date;
}
