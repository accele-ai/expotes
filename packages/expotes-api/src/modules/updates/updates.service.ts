import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';
import { assetsTable, manifestsTable } from '@expotes/db/schema';
import { FileMetadata } from './updates.interface';
import { v7 as uuidv7 } from 'uuid';
import {
  Database,
  DatabaseService,
} from 'src/processors/database/database.service';
import { ManifestService } from '../manifest/manifest.service';
import { AssetsService } from '../assets/assets.service';
import { StorageService } from './storage.services';
import { eq } from 'drizzle-orm';
// import mime from 'mime';

@Injectable()
export class UpdatesService {
  private s3Client: S3Client;

  constructor(
    private readonly db: DatabaseService,
    private readonly storageService: StorageService,
    private readonly manifestService: ManifestService,
    private readonly assetsService: AssetsService,
  ) {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: 'http://minio:9000',
      credentials: {
        accessKeyId: 'minio',
        secretAccessKey: 'minio',
      },
    });
  }

  private createAssetS3Key(
    runtimeVersion: number,
    mainfestId: string,
    assetName: string,
  ): string {
    return `${runtimeVersion}/${mainfestId}/${assetName}`;
  }

  private async createAsset(
    {
      assetId,
      runtimeVersion,
      manifestId,
      contentType,
      fileExtension,
      fileName,
      localPath,
    }: {
      assetId?: string;
      runtimeVersion: number;
      manifestId: string;
      contentType: string;
      fileExtension: string;
      fileName: string;
      localPath: string;
    },
    tx?: Database,
  ) {
    const s3Path = this.createAssetS3Key(runtimeVersion, manifestId, fileName);
    await this.storageService.uploadLocalFile({
      key: s3Path,
      path: localPath,
    });
    await this.assetsService.createAsset(
      {
        id: assetId ?? uuidv7(),
        path: s3Path,
        manifestId,
        contentType,
        fileExtension,
      },
      tx,
    );
  }

  async createUpdates(
    {
      appId,
      meta,
    }: {
      appId: string;
      meta: { runtimeVersion: string };
    },
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const manifestId = uuidv7();

    const extractPath = `tmp/extracted/${manifestId}/`;
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath, { recursive: true });
    }

    const zip = new AdmZip(file.buffer);
    await zip.extractAllToAsync(extractPath, true);

    const metadataPath = path.join(extractPath, 'metadata.json');

    if (!fs.existsSync(metadataPath)) {
      throw new Error('metadata.json not found in ZIP file');
    }

    const metadata: FileMetadata = JSON.parse(
      fs.readFileSync(metadataPath, 'utf8'),
    );

    const expoConfigPath = path.join(extractPath, 'expoConfig.json');
    const expoConfig = fs.existsSync(metadataPath)
      ? JSON.parse(fs.readFileSync(expoConfigPath, 'utf8'))
      : undefined;

    try {
      const fileMetadata = metadata.fileMetadata;
      const manifest = await this.db.transaction(async (tx) => {
        await tx.insert(manifestsTable).values({
          id: manifestId,
          appId,
          runtimeVersion: meta.runtimeVersion,
          createdAt: new Date(),
          extra: {
            expoClient: expoConfig,
          },
        });

        const iosLaunchAssetId = fileMetadata.ios ? uuidv7() : null;
        const iosBundlePath = fileMetadata.ios.bundle
          ? path.join(extractPath, fileMetadata.ios.bundle)
          : null;

        const assetsPromises = [];
        const mime = (await import('mime')).default;
        if (iosLaunchAssetId && iosBundlePath) {
          assetsPromises.push(
            this.createAsset(
              {
                assetId: iosLaunchAssetId,
                runtimeVersion: meta.runtimeVersion,
                manifestId,
                fileName: fileMetadata.ios.bundle,
                localPath: iosBundlePath,
                fileExtension: '.bundle',
                contentType: 'application/javascript',
              },
              tx,
            ),
          );
          assetsPromises.push(
            ...fileMetadata.ios.assets.map((asset) =>
              this.createAsset(
                {
                  manifestId,
                  runtimeVersion: meta.runtimeVersion,
                  contentType: mime.getType(asset.ext),
                  fileExtension: `.${asset.ext}`,
                  fileName: asset.path,
                  localPath: path.join(extractFolder, asset.path),
                },
                tx,
              ),
            ),
          );
        }
        const androidLaunchAssetId = fileMetadata.android ? uuidv7() : null;
        const androidBundlePath = fileMetadata.android.bundle
          ? path.join(extractPath, fileMetadata.android.bundle)
          : null;
        if (androidLaunchAssetId && androidBundlePath) {
          assetsPromises.push(
            this.createAsset(
              {
                assetId: androidLaunchAssetId,
                runtimeVersion: meta.runtimeVersion,
                manifestId,
                fileName: fileMetadata.android.bundle,
                localPath: androidBundlePath,
                fileExtension: '.bundle',
                contentType: 'application/javascript',
              },
              tx,
            ),
          );
        }

        await Promise.all(assetsPromises);

        return await tx
          .update(manifestsTable)
          .set({
            iosLaunchAssetId,
            androidLaunchAssetId,
            createdAt: new Date(),
          })
          .where(eq(manifestsTable.id, manifestId))
          .returning();
      });

      // 删除上传的ZIP文件（可选）
      fs.unlinkSync(extractPath);

      return manifest;
    } catch (e) {
      console.log(e);
    }
  }
}
