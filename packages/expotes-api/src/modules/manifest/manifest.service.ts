import { manifestsTable } from '@expotes/db/schema';
import { Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import {
  Database,
  DatabaseService,
} from 'src/processors/database/database.service';
import { DriectiveService } from './driective.service';
import { ExpoUpdatesV1Dto } from 'src/common/decorators/expo-updates-v1';
import { convertSHA256HashToUUID } from 'src/shared/utils/crypto.util';

export class NoUpdateAvailableError extends Error {}

type InsertManifest = typeof manifestsTable.$inferInsert;

@Injectable()
export class ManifestService {
  constructor(
    private readonly db: DatabaseService,
    private readonly directiveService: DriectiveService,
  ) {}

  async endpoint(meta: ExpoUpdatesV1Dto) {
    const manifest = await this.getLatestManifest(meta.runtimeVersion);
    if (manifest.isRollbacked) {
      return this.rollback(meta, manifest);
    }

    return;
  }

  async getLatestManifest(runtimeVersion: number) {
    const manifest = await this.db.query.manifestsTable.findFirst({
      where: eq(manifestsTable.runtimeVersion, runtimeVersion.toString()),
      orderBy: desc(manifestsTable.createdAt),
    });
    if (!manifest) {
      throw new NoUpdateAvailableError();
    }
    return manifest;
  }

  async getFullManifest(manifestId: string) {
    this.db.query.manifestsTable.findFirst({
      where: eq(manifestsTable.id, manifestId),
      columns: {
        id: true,
        createdAt: true,
        runtimeVersion: true,
        metadata: true,
        extra: true,
      },
      with: {
        assets: {
          columns: {
            hash: true,
            // key: true,
            contentType: true,
            fileExtension: true,
            path: true,
          },
        },
        // ioslaunchAsset: {
        //   columns: {
        //     hash: true,
        //     // key: true,
        //     contentType: true,
        //     fileExtension: true,
        //     path: true,
        //   },
        // },
      },
    });
    // return await this.db
    //   .select({
    //     id: manifestsTable.id,
    //     createdAt: manifestsTable.createdAt,
    //     runtimeVersion: manifestsTable.runtimeVersion,
    //     assets: [],
    //     launchAsset: {},
    //     metadata: {},
    //     extra: {
    //       // expoC
    //     },
    //   })
    //   .from(manifestsTable)
    //   .where(eq(manifestsTable.id, manifestId))
    //   .first();
  }
  async update(meta: ExpoUpdatesV1Dto, manifest: any) {
    if (
      meta.currentUpdateId === convertSHA256HashToUUID(manifest.id) &&
      meta.protocolVersion === 1
    ) {
      throw new NoUpdateAvailableError();
    }
  }
  async rollback(meta: ExpoUpdatesV1Dto, manifest: any) {
    if (meta.protocolVersion === 0) {
      throw new Error('Rollbacks not supported on protocol version 0');
    }
    if (!meta.embeddedUpdateId) {
      throw new Error(
        'Invalid Expo-Embedded-Update-ID request header specified.',
      );
    }
    if (meta.currentUpdateId === meta.embeddedUpdateId) {
      throw new NoUpdateAvailableError();
    }
    if (!manifest.rollbackedAt) {
      throw new Error('RollbackedAt not found');
    }
    return this.directiveService.RollBack(manifest.rollbackedAt.toISOString());
  }

  async noUpdate() {
    return await this.directiveService.NoUpdateAvailable();
  }

  async createManifest(manifest: InsertManifest, tx?: Database) {
    return await (tx ?? this.db).insert(manifestsTable).values(manifest);
  }
}
