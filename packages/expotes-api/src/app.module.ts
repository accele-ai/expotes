import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AssetsModule } from './modules/assets/assets.module';
import { ManifestModule } from './modules/manifest/manifest.module';
import { UpdatesModule } from './modules/updates/updates.module';
import { DatabaseModule } from './processors/database/database.module';
// import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MulterModule.register({
      dest: './uploads',
    }),
    DatabaseModule,
    // CacheModule,

    AssetsModule,
    ManifestModule,
    UpdatesModule,
  ],
})
export class AppModule {}
