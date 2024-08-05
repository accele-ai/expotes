import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JWTService<T extends object = object> {
  private secret: string;

  constructor(private readonly config: ConfigService) {
    this.secret = this.config.get<string>('jwtSecret')!;
    if (!this.secret) {
      throw new Error('JWT secret is not provided');
    }
  }

  async sign(payload: T): Promise<string> {
    return jwt.sign(payload, this.secret, { algorithm: 'HS256' });
  }

  async verify(token: string): Promise<T> {
    try {
      return jwt.verify(token, this.secret) as T;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
