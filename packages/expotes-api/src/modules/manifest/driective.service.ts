import { manifestsTable } from '@db/schema';
import { Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DatabaseService } from 'src/processors/database/database.service';

// enum UpdateType {
//   NORMAL_UPDATE:,
//   ROLLBACK,
// }

@Injectable()
export class DriectiveService {
  constructor(private readonly db: DatabaseService) {}

  create(type: string) {
    return {
      type,
    };
  }

  async NoUpdateAvailable() {
    return this.create('noUpdateAvailable');
  }

  async RollBack(rollbackTime: string) {
    return {
      type: 'rollBackToEmbedded',
      parameters: {
        commitTime: rollbackTime,
      },
    };
  }
}
