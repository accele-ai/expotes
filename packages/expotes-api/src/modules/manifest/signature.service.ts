import { manifestsTable } from '@db/schema';
import { Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DatabaseService } from 'src/processors/database/database.service';

@Injectable()
export class SignatureService {
  constructor(private readonly db: DatabaseService) {}
}
