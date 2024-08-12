import { DatabaseService } from '@/processors/database/database.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { usersTable } from '@db/index';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  findOne(email: string) {
    const user = this.db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
