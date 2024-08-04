import { DatabaseService } from '@/processors/database/database.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  create(user: any) {}
  findOne(username: string) {}
}
