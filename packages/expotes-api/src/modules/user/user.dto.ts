import { usersTable, usersToTeams, roleEnum } from '@db/index';

export type IUserInsert = typeof usersTable.$inferInsert;
export type IUser2TeamsInsert = typeof usersToTeams.$inferInsert;

export interface BasicUserDto {
  email: IUserInsert['email'];
  password: IUserInsert['password'];
}

export interface CreateUserDto extends BasicUserDto {}

export interface LoginUserDto extends BasicUserDto {}

export interface ExtraInfo {
  ua: string;
  geo?: string;
  ip: string;
}

export interface UpdateTeamUserDTO extends IUser2TeamsInsert {
  role: 'admin' | 'user';
  isSuspended: boolean;
}
