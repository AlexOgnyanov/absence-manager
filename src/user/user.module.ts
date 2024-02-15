import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
import { TokensModule } from 'src/tokens/tokens.module';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PermissionsModule,
    SendgridModule,
    TokensModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
