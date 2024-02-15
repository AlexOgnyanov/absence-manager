import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities';
import { JwtModule } from '@nestjs/jwt';
import { JwtAsyncConfig } from 'src/config';
import { PassportModule } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { PermissionEntity } from 'src/permissions/entities';
import { RoleEntity } from 'src/roles/entities';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { UserModule } from 'src/user/user.module';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
import { TokensModule } from 'src/tokens/tokens.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy';
import { JwtAuthGuard, PermissionsGuard } from './guards';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RoleEntity, PermissionEntity]),
    JwtModule.registerAsync(JwtAsyncConfig),
    PassportModule,
    UserModule,
    PermissionsModule,
    SendgridModule,
    TokensModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    JwtStrategy,
    JwtAuthGuard,
    PermissionsGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
