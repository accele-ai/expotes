import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
// import {CacheService} from '@/processors/cache/cache.service';

@Injectable()
export class AuthService {
  constructor() {} // private readonly cacheService: CacheService,

  async signUp(email: string, password: string): Promise<any> {}

  async validateUser(email: string, pass: string): Promise<any> {}
}
