import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AssetsModule } from './modules/assets/assets.module';
import { ManifestModule } from './modules/manifest/manifest.module';
import { UpdatesModule } from './modules/updates/updates.module';
import { DatabaseModule } from './processors/database/database.module';
import { UserModule } from '@/modules/user/user.module';
import { CacheModule } from '@/processors/cache/cache.module';
import { SessionModule } from '@/modules/session/session.module';
import { TeamModule } from './modules/team/team.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MulterModule.register({
      dest: './uploads',
    }),

    // processors
    DatabaseModule,
    CacheModule,

    // BIZ
    UserModule,
    TeamModule,
    AssetsModule,
    SessionModule,
    ManifestModule,
    UpdatesModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
