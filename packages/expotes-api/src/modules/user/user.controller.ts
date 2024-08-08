import { Body, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';

import { CreateUserDto, LoginUserDto } from '@/modules/user/user.dto';

import { Public } from '@/common/decorators/auth.decorator';
import { Owner } from '@/common/decorators/get-owner-decorator';
import { ISessionPayload } from '@/modules/session/session.dto';
import { Response } from 'express';
import { ApiController } from '@/common/decorators/api-controller.decorator';

@ApiController('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('/login')
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.userService.login(dto);
    return this.userService.signToken(response, result);
  }

  @Public()
  @Post('/register')
  async register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.userService.register(dto);
    return this.userService.signToken(response, result);
  }

  @Post('/logout')
  async logout(@Owner() owner: ISessionPayload) {
    return this.userService.logoutOne(owner.userId, owner.sessionId);
  }
}
