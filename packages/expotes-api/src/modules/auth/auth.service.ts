import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CacheService } from '@/processors/cache/cache.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
  ) {}

  async signUp(email: string, password: string): Promise<any> {

  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(email);
    if (user && user.password === pass) {
      return user;
    }
    return null;
  }
}
