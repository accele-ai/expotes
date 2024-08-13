import { Get } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiController } from '@/common/decorators/api-controller.decorator';
import { Owner } from '@/common/decorators/get-owner-decorator';
import { ISessionPayload } from '../session/session.dto';
import { IUserDto } from './user.dto';

@ApiController('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  me(@Owner() owner: ISessionPayload): IUserDto {
    return {
      email: owner.email,
      userId: owner.userId,
    };
  }
}
