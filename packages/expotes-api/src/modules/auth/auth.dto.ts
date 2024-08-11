import { usersTable } from '@db/index';

export type IUserInsert = typeof usersTable.$inferInsert;

export class CreateUserDto {
  email: NonNullable<IUserInsert['email']>;
  password: NonNullable<IUserInsert['password']>;
}

export class LoginUserDto {
  email: NonNullable<IUserInsert['email']>;
  password: NonNullable<IUserInsert['password']>;
}

export interface ExtraInfo {
  ua: string;
  geo?: string;
  ip: string;
}
