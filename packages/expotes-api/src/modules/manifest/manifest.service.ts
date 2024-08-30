import { assetsTable, manifestsTable } from '@db/schema';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import {
  Database,
  DatabaseService,
} from 'src/processors/database/database.service';
import { DriectiveService } from './driective.service';
import { ExpoUpdatesV1Dto } from 'src/common/decorators/expo-updates-v1';
import { convertSHA256HashToUUID } from 'src/shared/utils/crypto.util';
import { StorageService } from '../../processors/helper/storage.services';
import { BizException } from '@/common/exceptions/biz.exception';
import { ErrorCodeEnum } from '@/constants/error-code.constant';
import { API_URL } from '@/constants/system.config';

export class NoUpdateAvailableError extends Error {}

type SelectAsset = typeof assetsTable.$inferSelect;
type InsertManifest = typeof manifestsTable.$inferInsert;
type SelectManifest = typeof manifestsTable.$inferSelect;

@Injectable()
export class ManifestService {
  constructor(
    private readonly db: DatabaseService,
    private readonly storageService: StorageService,
    private readonly directiveService: DriectiveService,
  ) {}

  async endpoint(meta: ExpoUpdatesV1Dto, appId: string) {
    const manifest = await this.getLatestManifest(appId, meta.runtimeVersion);
    if (manifest.isRollbacked) {
      return this.rollback(meta, manifest);
    }

    return this.normalUpdate(meta, manifest);
  }

  async getLatestManifest(appId: string, runtimeVersion: string) {
    const manifest = await this.db.query.manifestsTable.findFirst({
      where: and(
        eq(manifestsTable.appId, appId),
        eq(manifestsTable.runtimeVersion, runtimeVersion),
      ),
      orderBy: desc(manifestsTable.createdAt),
    });
    if (!manifest) {
      throw new BizException(ErrorCodeEnum.ManifestNotFound);
    }
    return manifest;
  }

  async getFullManifest(manifestId: string) {
    const result = await this.db.query.manifestsTable.findFirst({
      where: eq(manifestsTable.id, manifestId),
      columns: {
        id: true,
        createdAt: true,
        runtimeVersion: true,
        metadata: true,
        extra: true,
      },
      with: {
        assets: true,
        iosLaunchAsset: true,
        androidLaunchAsset: true,
      },
    });
    if (!result) {
      throw new BizException(ErrorCodeEnum.ServerNotIdempotent);
    }
    return result;
  }
  /**
   * Retrieves the full manifest details for a given manifest ID.
   *
   * This method fetches comprehensive information about a manifest, including its
   * associated assets, iOS and Android launch assets, and metadata.
   *
   * @param manifestId - The unique identifier of the manifest to retrieve.
   * @returns A Promise that resolves to the full manifest object, including all related data.
   * @throws {ServiceUnavailableException} If the manifest with the given ID is not found.
   */
  private async transformAsset(asset: SelectAsset) {
    return {
      hash: asset.hash ?? undefined,
      key: asset.id,
      fileExtension: asset.fileExtension,
      contentType: asset.contentType,
      url: asset.path
        ? `${API_URL}/api/v1/assets/${asset.id}`
        : // ? await this.storageService.signUrl({ key: asset.path })
          undefined,
    };
  }

  /* normal update response */
  async normalUpdate(meta: ExpoUpdatesV1Dto, manifest: SelectManifest) {
    if (
      meta.currentUpdateId === convertSHA256HashToUUID(manifest.id) &&
      meta.protocolVersion === 1
    ) {
      throw new BizException(ErrorCodeEnum.NoUpdateAvailableError);
    }

    const fullManifest = await this.getFullManifest(manifest.id);
    return {
      id: fullManifest.id,
      createdAt: fullManifest.createdAt,
      runtimeVersion: fullManifest.runtimeVersion,
      launchAsset: await (async () => {
        const asset =
          meta.platform === 'ios'
            ? fullManifest.iosLaunchAsset
            : fullManifest.androidLaunchAsset;
        if (!asset) return null;
        return this.transformAsset(asset);
      })(),
      assets: await Promise.all(
        fullManifest.assets.map((asset) => this.transformAsset(asset)),
      ),
      metadata: fullManifest.metadata,
      extra: fullManifest.extra,
    };
  }

  /* rollback response */
  async rollback(meta: ExpoUpdatesV1Dto, manifest: any) {
    if (meta.protocolVersion === 0) {
      throw new BizException(ErrorCodeEnum.RollbackBadProtocolVersion);
    }
    if (!meta.embeddedUpdateId) {
      throw new BizException(ErrorCodeEnum.InvalidExpoEmbeddedUpdateId);
    }
    if (meta.currentUpdateId === meta.embeddedUpdateId) {
      throw new BizException(ErrorCodeEnum.NoUpdateAvailableError);
    }
    if (!manifest.rollbackedAt) {
      throw new BizException(ErrorCodeEnum.RollbackAtNotFound);
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
