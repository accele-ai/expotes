import { DatabaseService } from '@/processors/database/database.service';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './auth.dto';
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
export class AuthService {
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

  async logoutOne(userId: string, sessionId: string) {
    await this.sessionService.revokeOne(userId, sessionId);
  }

  async signToken(
    response: Response,
    data: SessionResult,
  ): Promise<SessionResult> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    response.cookie(SESSION_COOKIE_NAME, data.value, {
      expires: new Date(data.expires),
      httpOnly: true,
      path: '/',
    });
    return data;
  }

  async login(dto: LoginUserDto) {
    const user = await this.findOne(dto.email);

    if (
      !(user && user.password && (await compare(dto.password, user.password)))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.sessionService.create(user.id, {
      email: user.email,
      createdAt: new Date(),
    });
  }

  async register(dto: CreateUserDto) {
    const hashedPassword = await hash(dto.password, SALT_ROUNDS);

    const user = (
      await this.db
        .insert(usersTable)
        .values({
          id: uuidv4(),
          email: dto.email,
          password: hashedPassword,
        })
        .returning()
    )?.[0];
    return this.sessionService.create(user.id, {
      email: user.email,
      createdAt: new Date(),
    });
  }
}
