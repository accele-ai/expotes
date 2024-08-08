import { usersTable } from '@db/index';

export type IUserInsert = typeof usersTable.$inferInsert;

export class CreateUserDto {
  email: IUserInsert['email'];
  password: IUserInsert['password'];
}

export class LoginUserDto {
  email: IUserInsert['email'];
  password: IUserInsert['password'];
}

export interface ExtraInfo {
  ua: string;
  geo?: string;
  ip: string;
}
