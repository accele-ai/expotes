import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jose from 'jose';

@Injectable()
export class JWEService<T extends object = object> {
  private key: Uint8Array;

  constructor(private readonly config: ConfigService) {
    const secret = this.config.get<string>('jweSecret')!;
    if (!secret) {
      throw new Error('jwe key is not provided');
    }
    this.key = new TextEncoder().encode(secret);
  }

  async encrypt(payload: T): Promise<string> {
    const encoder = new TextEncoder();
    const jwe = await new jose.CompactEncrypt(
      encoder.encode(JSON.stringify(payload)),
    )
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .encrypt(this.key);
    return jwe;
  }

  async decrypt(token: string): Promise<T> {
    const { plaintext } = await jose.compactDecrypt(token, this.key);
    return JSON.parse(new TextDecoder().decode(plaintext)) as T;
  }
}
