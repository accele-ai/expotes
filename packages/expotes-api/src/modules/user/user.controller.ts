import { UserService } from './user.service';
import { ApiController } from '@/common/decorators/api-controller.decorator';

@ApiController('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
