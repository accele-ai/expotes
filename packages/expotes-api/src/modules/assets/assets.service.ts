import { assetsTable, manifestsTable } from '@db/schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import {
  Database,
  DatabaseService,
} from 'src/processors/database/database.service';
import { ManifestService } from '../manifest/manifest.service';
import { StorageService } from '../updates/storage.services';

type InsertAsset = typeof assetsTable.$inferInsert;

@Injectable()
export class AssetsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly manifestService: ManifestService,
  ) {}

  async getLatestBundlePath(runtimeVersion: number, assetName: string) {
    const manifests = this.manifestService.getLatestManifest(runtimeVersion);

    if (!manifests) {
      throw new Error('Unsupported runtime version');
    }
  }

  async getAsset(assetId: string) {
    const asset = await this.db.query.assetsTable.findFirst({
      where: eq(assetsTable.id, assetId),
    });
    if (!asset) {
      return new NotFoundException('Asset not found');
    }
    return asset;
  }

  async getAssetResponse(assetId: string) {
    const asset = await this.db.query.assetsTable.findFirst({
      where: eq(assetsTable.id, assetId),
      columns: {
        id: true,
        // key: true,
        // url: true,
        contentType: true,
        fileExtension: true,
      },
    });
    return asset;
  }

  async createAsset(asset: InsertAsset, tx?: Database) {
    return await (tx ?? this.db).insert(assetsTable).values(asset);
  }
}
