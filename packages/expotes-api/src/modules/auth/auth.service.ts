import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CacheService } from '@/processors/cache/cache.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
  ) {}

  async signUp(username: string, password: string): Promise<any> {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(username);
    if (user && user.password === pass) {
      return user;
    }
    return null;
  }
}
