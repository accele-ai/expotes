import { BaseError } from './base/base.exception';

export class TeamError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}
