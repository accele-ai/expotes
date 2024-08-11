import { DatabaseService } from '@/processors/database/database.service';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from '@/modules/user/user.dto';
import { v4 as uuidv4 } from 'uuid';
import { compare, hash } from 'bcrypt';
import { SALT_ROUNDS } from '@/constants/system.config';
import { usersTable } from '@db/index';
import { eq } from 'drizzle-orm';
import {
  SessionResult,
  SessionService,
} from '@/modules/session/session.service';
import { Response } from 'express';
import { SESSION_COOKIE_NAME } from '@/constants/cache.constant';

@Injectable()
export class UserService {
  constructor(
    private readonly db: DatabaseService,
    private readonly sessionService: SessionService,
  ) {}

  findOne(email: string) {
    const user = this.db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
