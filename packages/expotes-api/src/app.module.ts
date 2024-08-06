import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AssetsModule } from './modules/assets/assets.module';
// import { ManifestModule } from './modules/manifest/manifest.module';
// import { UpdatesModule } from './modules/updates/updates.module';
import { DatabaseModule } from './processors/database/database.module';
import { UserModule } from '@/modules/user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { SessionModule } from '@/modules/session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    DatabaseModule,
    CacheModule,
    UserModule,
    AssetsModule,
    SessionModule,
    // ManifestModule,
    // UpdatesModule,
  ],
})
export class AppModule {}
