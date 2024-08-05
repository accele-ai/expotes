import {DatabaseService} from '@/processors/database/database.service';
import {Injectable, InternalServerErrorException, UnauthorizedException} from '@nestjs/common';
import {CreateUserDto, ExtraInfo, IUserInsert, LoginUserDto} from "@/modules/user/user.dto";
import {v4 as uuidv4} from 'uuid';
import {hash} from 'bcrypt';
import {SALT_ROUNDS} from "@/constants/system.config";
import {usersTable} from "@expotes/db";
import {eq} from "drizzle-orm";
import {AuthService} from "@/modules/auth/auth.service";
import {SessionResult, SessionService} from "@/modules/session/session.service";
import {JWEService} from "@/processors/helper/jwe.service";
import {TokenPayload} from "@/common/guards/auth.guard";

@Injectable()
export class UserService {
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly jweService: JWEService<TokenPayload>,
  ) {
  }

  async create(dto: CreateUserDto) {
    try {
      // 加密
      const hashedPassword = await hash(dto.password, SALT_ROUNDS);

      // 插入
      return await this.db
        .insert(usersTable)
        .values({
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
      const user = await this.authService.validateUser(dto.email, hashedPassword);
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      return this.sessionService.create(user.id, {
        email: user.email,
        createdAt: new Date(),
        extra: extra,
      })
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

  async signToken(session : SessionResult): Promise<SessionResult> {
    return {
      value: await this.jweService.encrypt({
        token: session.value
      }),
      expires: session.expires,
    };
  }

  async logoutOne(userId: string, sessionId: string) {
    await this.sessionService.revokeOne(userId, sessionId)
  }
}
