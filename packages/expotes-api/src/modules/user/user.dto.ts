import { usersTable } from '@db/index';

export type IUserInsert = typeof usersTable.$inferInsert;

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
