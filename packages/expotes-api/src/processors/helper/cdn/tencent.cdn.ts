import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export interface TencentCDNOptions {
  url: string;
  key: string;
  key2: string;
  type: 'A' | 'B' | 'C' | 'D' | null;
  signKey?: string;
  timeKey?: string;
  ttlFormat?: number;
}

/* Interface for generating CDN URLs */
export interface GetCDNUrlProps {
  /* The path of the resource on the CDN */
  path: string;
  /* Optional suffix to append to the URL */
  suffix?: string;
  /* Optional timestamp for URL generation */
  ts?: string;
}

@Injectable()
export class TencentCDN {
  private url: string;
  private key: string; // Authentication key
  private key2: string; // Authentication key Backup
  private type: 'A' | 'B' | 'C' | 'D' | null;
  private signKey = 'sign'; // URL signature field
  private timeKey = 't'; // URL time field
  private ttlFormat = 10; // Time base, 10 or 16, only supported by typeD

  constructor(props: TencentCDNOptions) {
    this.url = props.url;
    this.key = props.key;
    this.key2 = props.key2;
    this.type = props.type;
    if (props.signKey) {
      this.signKey = props.signKey;
    }
    if (props.timeKey) {
      this.timeKey = props.timeKey;
    }
    if (props.ttlFormat) {
      this.ttlFormat = props.ttlFormat;
    }
  }

  generateUrl({ path, suffix, ts }: GetCDNUrlProps): string {
    const now = ts
      ? Math.floor(new Date(ts).getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    switch (this.type) {
      case null:
        return `${this.url}${path}${suffix || ''}`;
      case 'A':
        return this.generateTypeA(now, path, suffix);
      case 'B':
        return this.generateTypeB(now, path, suffix);
      case 'C':
        return this.generateTypeC(now, path, suffix);
      case 'D':
        return this.generateTypeD(now, path, suffix);
      default:
        throw new Error('Invalid category');
    }
  }

  private generateTypeA(now: number, path: string, suffix?: string): string {
    const ts = now;
    const randStr = crypto.randomBytes(3).toString('hex');

    // Ensure path starts with '/'
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    const sign = crypto
      .createHash('md5')
      .update(`${path}-${ts}-${randStr}-0-${this.key}`)
      .digest('hex');
    return `${this.url}${path}${suffix || ''}?${
      this.signKey
    }=${ts}-${randStr}-0-${sign}`;
  }

  private generateTypeB(now: number, path: string, suffix?: string): string {
    const ts = new Date(now * 1000)
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 12);
    const sign = crypto
      .createHash('md5')
      .update(`${this.key}${ts}${path}`)
      .digest('hex');
    return `${this.url}/${ts}/${sign}${path}${suffix || ''}`;
  }

  private generateTypeC(now: number, path: string, suffix?: string): string {
    const ts = now.toString(16);
    const sign = crypto
      .createHash('md5')
      .update(`${this.key}${path}${ts}`)
      .digest('hex');
    return `${this.url}/${sign}/${ts}${path}${suffix || ''}`;
  }

  private generateTypeD(now: number, path: string, suffix?: string): string {
    const ts = this.ttlFormat === 10 ? now : now.toString(16);
    const sign = crypto
      .createHash('md5')
      .update(`${this.key}${path}${ts}`)
      .digest('hex');
    return `${this.url}${path}${suffix || ''}?${this.signKey}=${sign}&${
      this.timeKey
    }=${ts}`;
  }
}
