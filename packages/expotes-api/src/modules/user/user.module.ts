import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SessionModule } from '@/modules/session/session.module';
import { HelperModule } from '@/processors/helper/helper.module';

@Module({
  imports: [SessionModule, HelperModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
