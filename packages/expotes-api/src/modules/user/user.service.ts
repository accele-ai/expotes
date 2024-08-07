import { DatabaseService } from '@/processors/database/database.service';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateUserDto,
  ExtraInfo,
  LoginUserDto,
} from '@/modules/user/user.dto';
import { v4 as uuidv4 } from 'uuid';
import { hash } from 'bcrypt';
import { SALT_ROUNDS } from '@/constants/system.config';
import { usersTable } from '@expotes/db';
import { eq } from 'drizzle-orm';
import {
  SessionResult,
  SessionService,
} from '@/modules/session/session.service';


@Injectable()
export class UserService {
  constructor(
    private readonly db: DatabaseService,
    private readonly sessionService: SessionService,
  ) {}

  async create(dto: CreateUserDto) {
    try {
      // 加密
      const hashedPassword = await hash(dto.password, SALT_ROUNDS);

      // 插入
      return await this.db.insert(usersTable).values({
        id: uuidv4(),
        email: dto.email,
        password: hashedPassword,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async login(dto: LoginUserDto, extra: ExtraInfo) {
    try {
      // 加密
      const hashedPassword = await hash(dto.password, SALT_ROUNDS);

      // 验证
      const user = await this.findOne(dto.email);
      if (!(user && user.password === hashedPassword)) {
        throw new UnauthorizedException('Invalid email or password');
      }

      return this.sessionService.create(user.id, {
        email: user.email,
        createdAt: new Date(),
        extra: extra,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw new InternalServerErrorException('Failed to login');
    }
  }

  findOne(email: string) {
    try {
      return this.db.query.usersTable.findFirst({
        where: eq(usersTable.email, email),
      });
    } catch (error) {
      console.log(error);
    }
  }

  async logoutOne(userId: string, sessionId: string) {
    await this.sessionService.revokeOne(userId, sessionId);
  }
}
