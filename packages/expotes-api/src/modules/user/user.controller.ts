import {Body, Controller, Post, Req} from '@nestjs/common';
import {UserService} from './user.service';
import {Request} from 'express';
import {CreateUserDto, LoginUserDto} from "@/modules/user/user.dto";
import {SessionResult} from "@/modules/session/session.service";
import {Auth} from "@/common/decorators/auth.decorator";
import {Owner} from "@/common/decorators/get-owner-decorator";
import {ISessionPayload} from "@/modules/session/session.dto";


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @Post('/create')
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Post('/login')
  async login(
    @Body() dto: LoginUserDto,
    @Req() req: Request
  ): Promise<SessionResult> {
    const extra = {
      ua: req.headers['user-agent'] || '',
      geo: (req.headers['x-geo'] as string) || '',
      ip: req.ip,
    };

    const session = await this.userService.login(dto, extra);
    return this.userService.signToken(session);
  }

  @Auth()
  @Post('/logout')
  async logout(@Owner() owner: ISessionPayload) {
    return this.userService.logoutOne(owner.userId, owner.sessionId);
  }

}
