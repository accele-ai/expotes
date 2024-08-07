import { roleEnum, usersTable, usersToTeams } from '@expotes/db';

export type IUserInsert = typeof usersTable.$inferInsert;
export type IUser2TeamsInsert = typeof usersToTeams.$inferInsert;

export interface BasicUserDto {
  email: IUserInsert['email'];
  password: IUserInsert['password'];
}

export interface CreateUserDto extends BasicUserDto {}

export interface LoginUserDto extends BasicUserDto {}

export interface UpdateTeamUserDTO extends IUser2TeamsInsert {
  role: keyof typeof roleEnum;
  isSuspend: boolean;
}
