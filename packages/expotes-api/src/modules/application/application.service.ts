import { DatabaseService } from '@/processors/database/database.service';
import { applicationsTable } from '@db/schema';
import { Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './application.dto';
import { v7 as uuidv7 } from 'uuid';
@Injectable()
export class ApplicationService {
  constructor(private readonly db: DatabaseService) {}

  create(body: CreateApplicationDto) {
    return this.db.insert(applicationsTable).values({
      id: uuidv7(),
      ...body,
    });
  }
}
